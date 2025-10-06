const config = {
    token: 'DISCORD_BOT_TOKEN',
    clientId: 'DISCORD_CLIENT_ID',
    guildId: 'DISCORD_GUILD_ID',
    mongoUri: 'MONGODB_CONNECTION_STRING',

    premiumPlans: {
        basic: {
            name: 'Basic',
            emoji: '🥉',
            color: '#3B82F6'
        },
        premium: {
            name: 'Premium',
            emoji: '🥈',
            color: '#F59E0B'
        },
        professional: {
            name: 'Professional',
            emoji: '🥇',
            color: '#A855F7'
        }
    }
};

module.exports = config;
