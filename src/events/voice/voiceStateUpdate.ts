import { Guild, GuildTextBasedChannel, time, VoiceState } from 'discord.js';
import { Database } from '../../shared/Database';

async function getVoiceLogsChannel(guild: Guild): Promise<GuildTextBasedChannel | undefined> {
  const settings = await Database.getOrCreateSettings(guild.id);
  if (!settings || !settings.voice_logs_channel_id) return;

  const channel = await guild.channels.fetch(settings.voice_logs_channel_id);
  if (!channel || !channel.isSendable()) return;

  return channel as GuildTextBasedChannel;
}

export default {
  event: 'voiceStateUpdate',

  handler: async (oldState: VoiceState, newState: VoiceState) => {
    if (newState.channelId != null && oldState.channelId != null && newState.channelId != oldState.channelId) {
      const channel = await getVoiceLogsChannel(newState.guild);
      if (!channel) return;

      await channel.send(`${newState.member!} moved from ${oldState} to ${newState} at ${time()}`);
    } else if (oldState.channelId == null && newState.channelId != null) {
      const channel = await getVoiceLogsChannel(newState.guild);
      if (!channel) return;

      await channel.send(`${newState.member!} joined ${newState} at ${time()}`);
    } else if (newState.channelId == null && oldState.channelId != null) {
      const channel = await getVoiceLogsChannel(newState.guild);
      if (!channel) return;

      await channel.send(`${oldState.member!} left ${oldState} at ${time()}`);
    }
  }
};
