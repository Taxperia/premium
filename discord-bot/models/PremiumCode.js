const mongoose = require('mongoose');

const premiumCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    plan: {
        type: String,
        enum: ['basic', 'premium', 'professional'],
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    usageLimit: {
        type: Number,
        default: 1
    },
    usedCount: {
        type: Number,
        default: 0
    },
    usedBy: [{
        userId: String,
        usedAt: Date
    }],
    note: {
        type: String,
        default: ''
    },
    createdBy: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

premiumCodeSchema.index({ code: 1 });
premiumCodeSchema.index({ isActive: 1 });

module.exports = mongoose.model('PremiumCode', premiumCodeSchema);
