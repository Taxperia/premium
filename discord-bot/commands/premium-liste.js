const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const PremiumManager = require('../utils/premiumManager');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('premium-liste')
        .setDescription('Sunucudaki tüm premium üyeleri listeler')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const premiums = await PremiumManager.getAllPremiums(interaction.guild.id);

            if (premiums.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#6B7280')
                    .setTitle('📋 Premium Üye Listesi')
                    .setDescription('Henüz premium üyesi bulunmuyor.')
                    .setTimestamp();

                return await interaction.editReply({ embeds: [embed] });
            }

            const itemsPerPage = 10;
            const totalPages = Math.ceil(premiums.length / itemsPerPage);
            let currentPage = 0;

            const generateEmbed = (page) => {
                const start = page * itemsPerPage;
                const end = start + itemsPerPage;
                const currentPremiums = premiums.slice(start, end);

                const embed = new EmbedBuilder()
                    .setColor('#3B82F6')
                    .setTitle('📋 Premium Üye Listesi')
                    .setDescription(`Toplam **${premiums.length}** premium üye`)
                    .setFooter({ text: `Sayfa ${page + 1}/${totalPages}` })
                    .setTimestamp();

                currentPremiums.forEach(premium => {
                    const planInfo = config.premiumPlans[premium.plan];
                    const remainingDays = Math.ceil((premium.endDate - new Date()) / (1000 * 60 * 60 * 24));

                    embed.addFields({
                        name: `${planInfo.emoji} ${planInfo.name}`,
                        value: `👤 <@${premium.userId}>\n` +
                               `⏱️ Kalan: ${remainingDays} gün\n` +
                               `📅 Bitiş: <t:${Math.floor(premium.endDate.getTime() / 1000)}:D>`,
                        inline: true
                    });
                });

                return embed;
            };

            const generateButtons = (page) => {
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('premium_first')
                            .setLabel('⏮️')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(page === 0),
                        new ButtonBuilder()
                            .setCustomId('premium_prev')
                            .setLabel('◀️')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page === 0),
                        new ButtonBuilder()
                            .setCustomId('premium_next')
                            .setLabel('▶️')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page === totalPages - 1),
                        new ButtonBuilder()
                            .setCustomId('premium_last')
                            .setLabel('⏭️')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(page === totalPages - 1)
                    );
                return row;
            };

            const message = await interaction.editReply({
                embeds: [generateEmbed(currentPage)],
                components: totalPages > 1 ? [generateButtons(currentPage)] : []
            });

            if (totalPages > 1) {
                const collector = message.createMessageComponentCollector({ time: 300000 });

                collector.on('collect', async i => {
                    if (i.user.id !== interaction.user.id) {
                        return await i.reply({ content: '❌ Bu butonları sadece komutu kullanan kişi kullanabilir!', ephemeral: true });
                    }

                    if (i.customId === 'premium_first') currentPage = 0;
                    if (i.customId === 'premium_prev') currentPage--;
                    if (i.customId === 'premium_next') currentPage++;
                    if (i.customId === 'premium_last') currentPage = totalPages - 1;

                    await i.update({
                        embeds: [generateEmbed(currentPage)],
                        components: [generateButtons(currentPage)]
                    });
                });

                collector.on('end', () => {
                    interaction.editReply({ components: [] }).catch(() => {});
                });
            }

        } catch (error) {
            console.error('Premium liste hatası:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#EF4444')
                .setTitle('❌ Hata')
                .setDescription('Premium listesi yüklenirken bir hata oluştu.')
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};
