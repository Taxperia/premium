const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const PremiumCode = require('../models/PremiumCode');
const PremiumManager = require('../utils/premiumManager');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kod-olustur')
        .setDescription('Premium kod oluşturur')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
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
                .setDescription('Premium süresi (gün)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(365))
        .addIntegerOption(option =>
            option
                .setName('limit')
                .setDescription('Kullanım limiti (varsayılan: 1)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(100))
        .addStringOption(option =>
            option
                .setName('not')
                .setDescription('Kod hakkında not')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const plan = interaction.options.getString('plan');
        const duration = interaction.options.getInteger('sure');
        const usageLimit = interaction.options.getInteger('limit') || 1;
        const note = interaction.options.getString('not') || '';

        try {
            let code;
            let exists = true;

            while (exists) {
                code = PremiumManager.generateCode(plan.substring(0, 3).toUpperCase());
                const existingCode = await PremiumCode.findOne({ code });
                if (!existingCode) exists = false;
            }

            const premiumCode = new PremiumCode({
                code,
                plan,
                duration,
                usageLimit,
                note,
                createdBy: interaction.user.id
            });

            await premiumCode.save();

            const planInfo = config.premiumPlans[plan];

            const embed = new EmbedBuilder()
                .setColor(planInfo.color)
                .setTitle('✅ Premium Kod Oluşturuldu')
                .addFields(
                    { name: '🎟️ Kod', value: `\`${code}\``, inline: false },
                    { name: '📦 Plan', value: `${planInfo.emoji} ${planInfo.name}`, inline: true },
                    { name: '⏱️ Süre', value: `${duration} gün`, inline: true },
                    { name: '🔢 Kullanım Limiti', value: `${usageLimit}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Premium Kod Sistemi' });

            if (note) {
                embed.addFields({ name: '📝 Not', value: note });
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Kod oluşturma hatası:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#EF4444')
                .setTitle('❌ Hata')
                .setDescription('Kod oluşturulurken bir hata oluştu.')
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};
