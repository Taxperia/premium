const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const PremiumCode = require('../models/PremiumCode');
const PremiumManager = require('../utils/premiumManager');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kod-kullan')
        .setDescription('Premium kodu kullanır')
        .addStringOption(option =>
            option
                .setName('kod')
                .setDescription('Kullanmak istediğiniz premium kod')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const codeInput = interaction.options.getString('kod').toUpperCase();

        try {
            const premiumCode = await PremiumCode.findOne({ code: codeInput });

            if (!premiumCode) {
                const embed = new EmbedBuilder()
                    .setColor('#EF4444')
                    .setTitle('❌ Geçersiz Kod')
                    .setDescription('Bu kod bulunamadı veya geçerli değil.')
                    .setTimestamp();

                return await interaction.editReply({ embeds: [embed] });
            }

            if (!premiumCode.isActive) {
                const embed = new EmbedBuilder()
                    .setColor('#EF4444')
                    .setTitle('❌ Pasif Kod')
                    .setDescription('Bu kod devre dışı bırakılmış.')
                    .setTimestamp();

                return await interaction.editReply({ embeds: [embed] });
            }

            if (premiumCode.usedCount >= premiumCode.usageLimit) {
                const embed = new EmbedBuilder()
                    .setColor('#EF4444')
                    .setTitle('❌ Kullanım Limiti Doldu')
                    .setDescription('Bu kod kullanım limitine ulaşmış.')
                    .setTimestamp();

                return await interaction.editReply({ embeds: [embed] });
            }

            const alreadyUsed = premiumCode.usedBy.some(usage => usage.userId === interaction.user.id);
            if (alreadyUsed) {
                const embed = new EmbedBuilder()
                    .setColor('#F59E0B')
                    .setTitle('⚠️ Uyarı')
                    .setDescription('Bu kodu zaten kullanmışsınız.')
                    .setTimestamp();

                return await interaction.editReply({ embeds: [embed] });
            }

            const premium = await PremiumManager.addPremium(
                interaction.user.id,
                interaction.guild.id,
                premiumCode.plan,
                premiumCode.duration,
                'code'
            );

            premiumCode.usedCount++;
            premiumCode.usedBy.push({
                userId: interaction.user.id,
                usedAt: new Date()
            });

            if (premiumCode.usedCount >= premiumCode.usageLimit) {
                premiumCode.isActive = false;
            }

            await premiumCode.save();

            const planInfo = config.premiumPlans[premiumCode.plan];

            const embed = new EmbedBuilder()
                .setColor(planInfo.color)
                .setTitle(`${planInfo.emoji} Premium Kod Kullanıldı!`)
                .setDescription('Tebrikler! Premium üyeliğiniz aktif edildi.')
                .addFields(
                    { name: '📦 Plan', value: `${planInfo.emoji} ${planInfo.name}`, inline: true },
                    { name: '⏱️ Süre', value: `${premiumCode.duration} gün`, inline: true },
                    { name: '📅 Bitiş Tarihi', value: `<t:${Math.floor(premium.endDate.getTime() / 1000)}:F>`, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'Premium Kod Sistemi' });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Kod kullanma hatası:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#EF4444')
                .setTitle('❌ Hata')
                .setDescription('Kod kullanılırken bir hata oluştu.')
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};
