import { ApplicationIntegrationType, ChatInputCommandInteraction, Client, GuildBasedChannel, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { channelIsInStaffCategory, getIdFromInput, handleWhoIsInteraction } from '../utils';

export default {
  name: 'whois',
  data: new SlashCommandBuilder()
    .setName('whois')
    .setDescription("Find a user's e621 account from their discord account, or vice versa.")
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption(option =>
      option
        .setName('user')
        .setDescription('The discord user mention, or ID, to find the e621 user of.')
        .setRequired(true)
    ),
  handler: async function (client: Client, interaction: ChatInputCommandInteraction) {
    const input = interaction.options.getString('user', true);

    const valueToUse = getIdFromInput(input);

    handleWhoIsInteraction(interaction, valueToUse, !(await channelIsInStaffCategory(interaction.channel as GuildBasedChannel)));
  }
};