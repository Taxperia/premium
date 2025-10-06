const express = require('express');
const router = express.Router();
const Premium = require('../models/Premium');
const PremiumCode = require('../models/PremiumCode');

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

router.get('/api/premium/list', async (req, res) => {
    try {
        const guildId = req.query.guildId;
        const premiums = await Premium.find({ guildId, status: 'active' }).sort({ endDate: -1 });
        res.json({ success: true, data: premiums });
    } catch (error) {
        console.error('Premium listesi hatası:', error);
        res.status(500).json({ success: false, error: 'Veriler yüklenemedi' });
    }
});

router.post('/api/premium/add', async (req, res) => {
    try {
        const { userId, guildId, plan, duration } = req.body;
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

router.put('/api/premium/update', async (req, res) => {
    try {
        const { userId, guildId, plan, endDate, status } = req.body;

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

router.delete('/api/premium/remove', async (req, res) => {
    try {
        const { userId, guildId } = req.body;

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

router.post('/api/premium/code/generate', async (req, res) => {
    try {
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

module.exports = router;
