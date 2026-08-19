import { GuildBan } from 'discord.js';
import { Database } from '../../shared/Database';

export default {
  event: 'guildBanRemove',

  handler: async (ban: GuildBan) => {
    await Database.removeBan(ban.user.id);
  }
};
