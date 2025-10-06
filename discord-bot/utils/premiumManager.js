const Premium = require('../models/Premium');
const PremiumCode = require('../models/PremiumCode');

class PremiumManager {
    static async checkPremium(userId, guildId) {
        try {
            const premium = await Premium.findOne({ userId, guildId, status: 'active' });

            if (!premium) return null;

            if (new Date() > premium.endDate) {
                premium.status = 'expired';
                await premium.save();
                return null;
            }

            return premium;
        } catch (error) {
            console.error('Premium kontrol hatası:', error);
            return null;
        }
    }

    static async addPremium(userId, guildId, plan, duration, activatedBy) {
        try {
            const existingPremium = await Premium.findOne({ userId, guildId });

            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + duration);

            if (existingPremium) {
                if (existingPremium.status === 'active' && existingPremium.endDate > new Date()) {
                    endDate.setTime(existingPremium.endDate.getTime() + (duration * 24 * 60 * 60 * 1000));
                }

                existingPremium.plan = plan;
                existingPremium.endDate = endDate;
                existingPremium.status = 'active';
                existingPremium.activatedBy = activatedBy;

                await existingPremium.save();
                return existingPremium;
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
            return premium;
        } catch (error) {
            console.error('Premium ekleme hatası:', error);
            throw error;
        }
    }

    static async removePremium(userId, guildId) {
        try {
            const premium = await Premium.findOne({ userId, guildId });

            if (!premium) return false;

            await Premium.deleteOne({ userId, guildId });
            return true;
        } catch (error) {
            console.error('Premium kaldırma hatası:', error);
            throw error;
        }
    }

    static async updatePremium(userId, guildId, updates) {
        try {
            const premium = await Premium.findOne({ userId, guildId });

            if (!premium) return null;

            Object.assign(premium, updates);
            await premium.save();

            return premium;
        } catch (error) {
            console.error('Premium güncelleme hatası:', error);
            throw error;
        }
    }

    static async getAllPremiums(guildId) {
        try {
            return await Premium.find({ guildId, status: 'active' }).sort({ endDate: -1 });
        } catch (error) {
            console.error('Premium listesi hatası:', error);
            return [];
        }
    }

    static generateCode(prefix = 'PREM') {
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
}

module.exports = PremiumManager;
