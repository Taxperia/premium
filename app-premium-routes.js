const mongoose = require('mongoose');
const { PermissionFlagsBits } = require('discord.js');

const premiumSchema = new mongoose.Schema({
    userId: String,
    guildId: String,
    plan: String,
    startDate: Date,
    endDate: Date,
    status: String,
    activatedBy: String
}, { timestamps: true });

const premiumCodeSchema = new mongoose.Schema({
    code: String,
    plan: String,
    duration: Number,
    usageLimit: Number,
    usedCount: { type: Number, default: 0 },
    usedBy: [{ userId: String, usedAt: Date }],
    note: String,
    createdBy: String,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Premium = mongoose.models.Premium || mongoose.model('Premium', premiumSchema);
const PremiumCode = mongoose.models.PremiumCode || mongoose.model('PremiumCode', premiumCodeSchema);

function generateCode(prefix = 'PREM') {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = prefix + '-';
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 4; j++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        if (i < 2) code += '-';
    }
    return code;
}

module.exports = function(app, client, conf, translations) {

    app.get("/yonetim/premium", async (req, res) => {
        if (!req.user) {
            return res.redirect("/login-error");
        }

        const lang = req.cookies.lang || "tr";
        const guild = client.guilds.cache.get(conf.guildID);

        if (!translations[lang]) {
            console.warn(`Geçersiz dil: ${lang}. Varsayılan olarak 'tr' kullanılıyor.`);
        }

        const member = await guild.members.fetch(req.user.id);
        if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
            return res.redirect("/admin-error");
        }

        let auth;
        if (guild.roles.cache.has(conf.bsahip)) auth = "Bot Sahibi";
        else if (guild.roles.cache.has(conf.admin)) auth = "Taxperia Yetkili";

        let isStaff;
        if (guild.roles.cache.has(conf.ownerRole)) isStaff = "Owner";

        try {
            const premiums = await Premium.find({ guildId: conf.guildID, status: 'active' }).sort({ endDate: -1 });

            res.render("adminpanel/premium", {
                user: req.user,
                member: req.isAuthenticated() ? req.user : null,
                guild,
                conf,
                translations: translations[lang],
                auth,
                icon: client.guilds.cache.get(conf.guildID).iconURL({ dynamic: true }),
                bot: client,
                path: req.path,
                isStaff,
                reqMember: req.user ? client.guilds.cache.get(conf.guildID).members.cache.get(req.user.id) : null,
                premiums: premiums || []
            });
        } catch (error) {
            console.error('Premium sayfa hatası:', error);
            res.render("adminpanel/premium", {
                user: req.user,
                member: req.isAuthenticated() ? req.user : null,
                guild,
                conf,
                translations: translations[lang],
                auth,
                icon: client.guilds.cache.get(conf.guildID).iconURL({ dynamic: true }),
                bot: client,
                path: req.path,
                isStaff,
                reqMember: req.user ? client.guilds.cache.get(conf.guildID).members.cache.get(req.user.id) : null,
                premiums: []
            });
        }
    });

    app.get('/api/premium/list', async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: 'Yetkisiz erişim' });
            }

            const guildId = conf.guildID;
            const premiums = await Premium.find({ guildId, status: 'active' }).sort({ endDate: -1 });

            const guild = client.guilds.cache.get(guildId);
            const premiumsWithUserInfo = await Promise.all(premiums.map(async (premium) => {
                try {
                    const member = await guild.members.fetch(premium.userId);
                    return {
                        id: premium.userId,
                        username: member.user.username,
                        discriminator: member.user.discriminator,
                        avatar: member.user.displayAvatarURL({ dynamic: true }),
                        plan: premium.plan,
                        startDate: premium.startDate,
                        endDate: premium.endDate,
                        status: premium.status
                    };
                } catch (error) {
                    return {
                        id: premium.userId,
                        username: 'Bilinmeyen Kullanıcı',
                        discriminator: '0000',
                        avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
                        plan: premium.plan,
                        startDate: premium.startDate,
                        endDate: premium.endDate,
                        status: premium.status
                    };
                }
            }));

            res.json({ success: true, data: premiumsWithUserInfo });
        } catch (error) {
            console.error('Premium listesi hatası:', error);
            res.status(500).json({ success: false, error: 'Veriler yüklenemedi' });
        }
    });

    app.post('/api/premium/add', async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: 'Yetkisiz erişim' });
            }

            const { userId, plan, duration } = req.body;
            const guildId = conf.guildID;
            const activatedBy = req.user.id;

            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + parseInt(duration));

            const existingPremium = await Premium.findOne({ userId, guildId });

            if (existingPremium) {
                if (existingPremium.status === 'active' && existingPremium.endDate > new Date()) {
                    endDate.setTime(existingPremium.endDate.getTime() + (duration * 24 * 60 * 60 * 1000));
                }
                existingPremium.plan = plan;
                existingPremium.endDate = endDate;
                existingPremium.status = 'active';
                existingPremium.activatedBy = activatedBy;
                await existingPremium.save();

                return res.json({ success: true, data: existingPremium });
            }

            const premium = new Premium({
                userId,
                guildId,
                plan,
                startDate,
                endDate,
                status: 'active',
                activatedBy
            });

            await premium.save();
            res.json({ success: true, data: premium });
        } catch (error) {
            console.error('Premium ekleme hatası:', error);
            res.status(500).json({ success: false, error: 'Premium eklenemedi' });
        }
    });

    app.put('/api/premium/update', async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: 'Yetkisiz erişim' });
            }

            const { userId, plan, endDate, status } = req.body;
            const guildId = conf.guildID;

            const premium = await Premium.findOne({ userId, guildId });

            if (!premium) {
                return res.status(404).json({ success: false, error: 'Premium bulunamadı' });
            }

            premium.plan = plan;
            premium.endDate = new Date(endDate);
            premium.status = status;

            await premium.save();
            res.json({ success: true, data: premium });
        } catch (error) {
            console.error('Premium güncelleme hatası:', error);
            res.status(500).json({ success: false, error: 'Premium güncellenemedi' });
        }
    });

    app.delete('/api/premium/remove', async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: 'Yetkisiz erişim' });
            }

            const { userId } = req.body;
            const guildId = conf.guildID;

            const result = await Premium.deleteOne({ userId, guildId });

            if (result.deletedCount === 0) {
                return res.status(404).json({ success: false, error: 'Premium bulunamadı' });
            }

            res.json({ success: true, message: 'Premium kaldırıldı' });
        } catch (error) {
            console.error('Premium kaldırma hatası:', error);
            res.status(500).json({ success: false, error: 'Premium kaldırılamadı' });
        }
    });

    app.post('/api/premium/code/generate', async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: 'Yetkisiz erişim' });
            }

            const { plan, duration, usageLimit, note } = req.body;
            const createdBy = req.user.id;

            let code;
            let exists = true;

            while (exists) {
                code = generateCode(plan.substring(0, 3).toUpperCase());
                const existingCode = await PremiumCode.findOne({ code });
                if (!existingCode) exists = false;
            }

            const premiumCode = new PremiumCode({
                code,
                plan,
                duration: parseInt(duration),
                usageLimit: parseInt(usageLimit) || 1,
                note: note || '',
                createdBy
            });

            await premiumCode.save();
            res.json({ success: true, data: premiumCode });
        } catch (error) {
            console.error('Kod oluşturma hatası:', error);
            res.status(500).json({ success: false, error: 'Kod oluşturulamadı' });
        }
    });
};
