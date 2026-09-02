import { ApplicationIntegrationType, ChatInputCommandInteraction, Client, Guild, GuildMember, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder, time, TimestampStyles, User } from 'discord.js';
import { Database } from '../shared/Database';
import { AltData, calculateDuration, comprehensiveAltLookupFromDiscord, deferInteraction, getIdFromInput, isDurationValid } from '../utils';

export default {
  name: 'ban',
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bans a user.')
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption(option =>
      option
        .setName('user')
        .setDescription('The discord user mention, or ID, to ban.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('The reason for the ban')
        .setRequired(false)
        .setMaxLength(400)
    )
    .addStringOption(option =>
      option
        .setName('duration')
        .setDescription('The duration of the ban (e.g., 1d2h3m).')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('cleanup')
        .setDescription('Duration of messages to delete (e.g., 1d2h3m).')
        .setRequired(false)
    )
    .addBooleanOption(option =>
      option
        .setName('full-ban')
        .setDescription('Whether or not to prevent the user from joining on known alts (and ban all existing alts).')
        .setRequired(false)
    ),
  handler: async function (client: Client, interaction: ChatInputCommandInteraction) {
    await deferInteraction(interaction);

    if (!interaction.guild) return interaction.editReply('This command must be used in a server');

    if (!interaction.guild.members.me) return interaction.editReply('An error has occurred. Please try again later.');

    const input = interaction.options.getString('user', true);

    const idToUse = getIdFromInput(input);
    const reason = interaction.options.getString('reason') ?? '';

    // Get and validate the duration and cleanup options
    const durationString = interaction.options.getString('duration');
    if (durationString && !isDurationValid(durationString)) return await interaction.editReply('Invalid duration format. Please use a valid format: 1d2h3m.');
    const duration = calculateDuration(durationString ?? '0s');

    const cleanupString = interaction.options.getString('cleanup');
    if (cleanupString && !isDurationValid(cleanupString)) return await interaction.editReply('Invalid cleanup duration format. Please use a valid format: 1d2h3m.');
    const cleanup = cleanupString ? calculateDuration(cleanupString) / 1000 : 0;

    const fullBan = interaction.options.getBoolean('full-ban') ?? false;

    let member: GuildMember | null = null;

    try {
      member = await interaction.guild.members.fetch(idToUse);

      const actor = await interaction.guild.members.fetch(interaction.user.id);
      if (actor.roles.highest.comparePositionTo(member.roles.highest) <= 0)
        return await interaction.editReply('You do not have permission to ban this user.');

      if (!member.bannable)
        return await interaction.editReply('I do not have permission to ban this user.');
    } catch (e) {
      // Member not in server.
    }

    const expiresAt = new Date(Date.now() + duration);
    await Database.putBan(idToUse, duration > 0 ? expiresAt : null, fullBan);

    try {
      await interaction.guild.bans.create(idToUse, {
        reason: (reason + ` ${fullBan ? 'Full banned' : 'Banned'} by ${interaction.user.username} (${interaction.user.id})${duration > 0 ? `. Expires at: ${time(expiresAt, TimestampStyles.ShortDateTime)}` : ''}`).trim(),
        deleteMessageSeconds: cleanup
      });
    } catch (e) {
      console.error(e);
      return await interaction.editReply(`Failed to ban <@${idToUse}> (${idToUse}).`);
    }

    if (fullBan) {
      const alts = await comprehensiveAltLookupFromDiscord(idToUse, interaction.guild);
      await removeAllAlts([alts], interaction.guild, interaction.user, fullBan, reason, duration, expiresAt);
    }

    await interaction.editReply(`Successfully banned <@${idToUse}> (${idToUse})${duration > 0 ? `. Expires at: ${time(expiresAt, TimestampStyles.ShortDateTime)}` : ''}${fullBan ? ' and all known alts' : ''}.`);
  }
};

async function removeAllAlts(altData: AltData[], guild: Guild, moderator: User, fullBan: boolean, reason: string, duration: number, expiresAt: Date) {
  for (const data of altData) {
    if (data.type == 'discord') {
      try {
        if (!data.banned) {
          await guild.members.kick(data.thisId as string, (reason + ` ${fullBan ? 'Full banned' : 'Banned'} by ${moderator.username} (${moderator.id})${duration > 0 ? `. Expires at: ${time(expiresAt, TimestampStyles.ShortDateShortTime)}` : ''}`).trim());
        }
      } catch (e) {
        console.error(e);
      }
    }

    await removeAllAlts(data.alts, guild, moderator, fullBan, reason, duration, expiresAt);
  }
}