import { GuildMember, GuildTextBasedChannel } from 'discord.js';
import { Database } from '../../shared/Database';
import { getE621Alts } from '../../utils';

export default {
  event: 'guildMemberAdd',

  handler: async (member: GuildMember) => {
    const settings = await Database.getOrCreateSettings(member.guild.id);

    if (settings.new_member_channel_id) {
      const channel = await member.guild.channels.fetch(settings.new_member_channel_id) as GuildTextBasedChannel;

      if (channel) {
        const content = `${member.toString()}'s (${member.id}) e621 and discord account(s):\n${await getE621Alts(member.id, member.guild)}`;

        channel.send(content).catch(console.error);

        if (settings.moderator_channel_id && content.includes('[BANNED]')) {
          const modChannel = await member.guild.channels.fetch(settings.moderator_channel_id) as GuildTextBasedChannel;

          if (modChannel) modChannel.send(`Member joined with banned alts:\n${content}`).catch(console.error);
        }
      }
    }
  }
};
