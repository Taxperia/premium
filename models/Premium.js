const mongoose = require('mongoose');

const premiumSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    guildId: {
        type: String,
        required: true
    },
    plan: {
        type: String,
        enum: ['basic', 'premium', 'professional'],
        required: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'expired'],
        default: 'active'
    },
    activatedBy: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

premiumSchema.index({ userId: 1, guildId: 1 });
premiumSchema.index({ endDate: 1 });

module.exports = mongoose.models.Premium || mongoose.model('Premium', premiumSchema);
