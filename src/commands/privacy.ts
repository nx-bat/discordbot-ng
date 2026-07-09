import { ApplicationIntegrationType, ChatInputCommandInteraction, Client, InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { config } from '../config';

export default {
  name: 'privacy',
  data: new SlashCommandBuilder()
    .setName('privacy')
    .setDescription('Get a link to the privacy policy.')
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM),
  handler: async function (client: Client, interaction: ChatInputCommandInteraction) {
    await interaction.reply({ content: `You can view my privacy policy here: ${config.PRIVACY_POLICY_URL}`, flags: [MessageFlags.Ephemeral] });
  }
};