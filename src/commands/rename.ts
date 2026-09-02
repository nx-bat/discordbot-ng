import { ApplicationIntegrationType, ChatInputCommandInteraction, Client, InteractionContextType, MessageFlags, PermissionFlagsBits, RateLimitError, SlashCommandBuilder } from 'discord.js';
import { CreateDefaultEmbed } from '../utils';
import { Database } from '../shared/Database';

export default {
  name: 'rename',
  data: new SlashCommandBuilder()
    .setName('rename')
    .setDescription('Rename the general channel.')
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption(option =>
      option
        .setName('new-name')
        .setDescription('The new name of the general channel.')
        .setRequired(true)
        .setMaxLength(100)
    ),
  handler: async function (client: Client, interaction: ChatInputCommandInteraction) {
    const settings = await Database.getOrCreateSettings(interaction.guildId!);
    if (!settings.general_chat_id) {
      return await interaction.reply({
        content: 'The general channel has not been set up yet. Configure one with /settings, then try again.',
        flags: [MessageFlags.Ephemeral]
      });
    }

    const channel = await interaction.guild!.channels.fetch(settings.general_chat_id)!;
    if (!channel) {
      return await interaction.reply({
        content: 'The general channel could not be found. It may have been deleted. Configure a new one with /settings, then try again.',
        flags: [MessageFlags.Ephemeral]
      });
    }

    try {
      await channel.setName(interaction.options.getString('new-name', true));

      if (!channel.isTextBased() || !channel.isSendable()) return;
      await channel.send({
        embeds: [{
          ...CreateDefaultEmbed(client),

          author: {
            name: interaction.user.username,
            icon_url: interaction.user.displayAvatarURL(),
          },

          description: `*${interaction.user.username}* renamed the general channel to: **${channel.name}**.`,
        }],
      });
    } catch (e: any) {
      if (e instanceof RateLimitError) {
        return await interaction.reply({
          content: 'The general channel was renamed too recently. Please wait a few seconds and try again.',
          flags: [MessageFlags.Ephemeral]
        });
      }

      console.error(e);

      return await interaction.reply({
        content: 'An error occurred while renaming the general channel. Please try again later.',
        flags: [MessageFlags.Ephemeral]
      });
    }
  },
};
