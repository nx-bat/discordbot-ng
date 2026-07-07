import { ApplicationIntegrationType, ChatInputCommandInteraction, Client, InteractionContextType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { Database } from '../shared/Database';
import { getIdFromInput } from '../utils';

export default {
  name: 'database',
  data: new SlashCommandBuilder()
    .setName('database')
    .setDescription('Database access.')
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommandGroup(subcommandGroup =>
      subcommandGroup
        .setName('messages')
        .setDescription('Access to messages in the database.')
        .addSubcommand(subcommand =>
          subcommand
            .setName('purge')
            .setDescription("Purge a user's messages from the database.")
            .addStringOption(option =>
              option
                .setName('user')
                .setDescription('The discord user id, or mention, of the user.')
                .setRequired(true)
            )
        )
    ),
  handler: async function (client: Client, interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const group = interaction.options.getSubcommandGroup(true);

    const subcommand = interaction.options.getSubcommand(true);

    if (group == 'messages') {
      if (subcommand == 'purge') {
        const discordUserInput = interaction.options.getString('discord-user', true);

        const idToUse = getIdFromInput(discordUserInput);

        await Database.purgeMessagesFrom(idToUse);

        return interaction.editReply('Messages purged.');
      }
    }
  }
};