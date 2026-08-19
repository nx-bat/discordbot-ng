import { Guild } from 'discord.js';
import { Database } from '../../shared/Database';

export default {
  event: 'guildCreate',

  handler: async (guild: Guild) => {
    await Database.getOrCreateSettings(guild.id);
  }
};
