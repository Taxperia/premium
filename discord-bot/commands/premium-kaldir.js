const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const PremiumManager = require('../utils/premiumManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('premium-kaldir')
        .setDescription('Bir kullanıcının premium üyeliğini kaldırır')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option
                .setName('kullanici')
                .setDescription('Premium üyeliği kaldırılacak kullanıcı')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getUser('kullanici');

        try {
            const premium = await PremiumManager.checkPremium(targetUser.id, interaction.guild.id);

            if (!premium) {
                const embed = new EmbedBuilder()
                    .setColor('#F59E0B')
                    .setTitle('⚠️ Uyarı')
                    .setDescription(`${targetUser} kullanıcısının aktif bir premium üyeliği bulunamadı.`)
                    .setTimestamp();

                return await interaction.editReply({ embeds: [embed] });
            }

            await PremiumManager.removePremium(targetUser.id, interaction.guild.id);

            const embed = new EmbedBuilder()
                .setColor('#10B981')
                .setTitle('✅ Premium Üyelik Kaldırıldı')
                .setDescription(`${targetUser} kullanıcısının premium üyeliği başarıyla kaldırıldı.`)
                .addFields(
                    { name: '👤 Kullanıcı', value: `${targetUser.tag}`, inline: true },
                    { name: '👮 Kaldıran', value: `${interaction.user}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Premium Sistem' });

            await interaction.editReply({ embeds: [embed] });

            try {
                const userEmbed = new EmbedBuilder()
                    .setColor('#EF4444')
                    .setTitle('❌ Premium Üyelik Sonlandırıldı')
                    .setDescription(`**${interaction.guild.name}** sunucusundaki premium üyeliğiniz sonlandırıldı.`)
                    .setTimestamp();

                await targetUser.send({ embeds: [userEmbed] });
            } catch (error) {
                console.log('DM gönderilemedi:', error.message);
            }

        } catch (error) {
            console.error('Premium kaldırma hatası:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#EF4444')
                .setTitle('❌ Hata')
                .setDescription('Premium kaldırılırken bir hata oluştu.')
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};
