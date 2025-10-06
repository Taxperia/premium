const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const PremiumManager = require('../utils/premiumManager');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('premium-ekle')
        .setDescription('Bir kullanıcıya premium üyelik ekler')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option
                .setName('kullanici')
                .setDescription('Premium verilecek kullanıcı')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('plan')
                .setDescription('Premium plan türü')
                .setRequired(true)
                .addChoices(
                    { name: '🥉 Basic', value: 'basic' },
                    { name: '🥈 Premium', value: 'premium' },
                    { name: '🥇 Professional', value: 'professional' }
                ))
        .addIntegerOption(option =>
            option
                .setName('sure')
                .setDescription('Premium süresi (gün cinsinden)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(365)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getUser('kullanici');
        const plan = interaction.options.getString('plan');
        const duration = interaction.options.getInteger('sure');

        try {
            const premium = await PremiumManager.addPremium(
                targetUser.id,
                interaction.guild.id,
                plan,
                duration,
                interaction.user.id
            );

            const planInfo = config.premiumPlans[plan];

            const embed = new EmbedBuilder()
                .setColor(planInfo.color)
                .setTitle(`${planInfo.emoji} Premium Üyelik Eklendi`)
                .setDescription(`${targetUser} kullanıcısına premium üyelik başarıyla eklendi!`)
                .addFields(
                    { name: '👤 Kullanıcı', value: `${targetUser.tag}`, inline: true },
                    { name: '📦 Plan', value: `${planInfo.emoji} ${planInfo.name}`, inline: true },
                    { name: '⏱️ Süre', value: `${duration} gün`, inline: true },
                    { name: '📅 Başlangıç', value: `<t:${Math.floor(premium.startDate.getTime() / 1000)}:D>`, inline: true },
                    { name: '📅 Bitiş', value: `<t:${Math.floor(premium.endDate.getTime() / 1000)}:D>`, inline: true },
                    { name: '👮 Ekleyen', value: `${interaction.user}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Premium Sistem' });

            await interaction.editReply({ embeds: [embed] });

            try {
                const userEmbed = new EmbedBuilder()
                    .setColor(planInfo.color)
                    .setTitle(`${planInfo.emoji} Premium Üyelik Hediye Edildi!`)
                    .setDescription(`**${interaction.guild.name}** sunucusunda premium üyelik kazandınız!`)
                    .addFields(
                        { name: '📦 Plan', value: `${planInfo.emoji} ${planInfo.name}`, inline: true },
                        { name: '⏱️ Süre', value: `${duration} gün`, inline: true },
                        { name: '📅 Bitiş Tarihi', value: `<t:${Math.floor(premium.endDate.getTime() / 1000)}:F>` }
                    )
                    .setTimestamp();

                await targetUser.send({ embeds: [userEmbed] });
            } catch (error) {
                console.log('DM gönderilemedi:', error.message);
            }

        } catch (error) {
            console.error('Premium ekleme hatası:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#EF4444')
                .setTitle('❌ Hata')
                .setDescription('Premium eklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.')
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};
