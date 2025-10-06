const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const PremiumManager = require('../utils/premiumManager');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('premium-kontrol')
        .setDescription('Bir kullanıcının premium durumunu kontrol eder')
        .addUserOption(option =>
            option
                .setName('kullanici')
                .setDescription('Kontrol edilecek kullanıcı (boş bırakırsanız kendinizi kontrol eder)')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getUser('kullanici') || interaction.user;

        try {
            const premium = await PremiumManager.checkPremium(targetUser.id, interaction.guild.id);

            if (!premium) {
                const embed = new EmbedBuilder()
                    .setColor('#6B7280')
                    .setTitle('❌ Premium Üyelik Yok')
                    .setDescription(`${targetUser} kullanıcısının aktif bir premium üyeliği bulunmuyor.`)
                    .setTimestamp();

                return await interaction.editReply({ embeds: [embed] });
            }

            const planInfo = config.premiumPlans[premium.plan];
            const remainingDays = Math.ceil((premium.endDate - new Date()) / (1000 * 60 * 60 * 24));

            const embed = new EmbedBuilder()
                .setColor(planInfo.color)
                .setTitle(`${planInfo.emoji} Premium Üyelik Bilgisi`)
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '👤 Kullanıcı', value: `${targetUser.tag}`, inline: true },
                    { name: '📦 Plan', value: `${planInfo.emoji} ${planInfo.name}`, inline: true },
                    { name: '✅ Durum', value: premium.status === 'active' ? '🟢 Aktif' : '🔴 Pasif', inline: true },
                    { name: '📅 Başlangıç', value: `<t:${Math.floor(premium.startDate.getTime() / 1000)}:D>`, inline: true },
                    { name: '📅 Bitiş', value: `<t:${Math.floor(premium.endDate.getTime() / 1000)}:D>`, inline: true },
                    { name: '⏱️ Kalan Süre', value: `${remainingDays} gün`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Premium Sistem' });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Premium kontrol hatası:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#EF4444')
                .setTitle('❌ Hata')
                .setDescription('Premium kontrol edilirken bir hata oluştu.')
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};
