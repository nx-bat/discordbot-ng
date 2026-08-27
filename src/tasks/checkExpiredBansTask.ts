import { Client } from 'discord.js';
import { checkExpiredBans } from '../utils';

export default {
  interval: 300000,
  firstRun: true,

  handler: async (context: Client) => {
    await checkExpiredBans(context);
  },
};
