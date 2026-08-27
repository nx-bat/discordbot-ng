import { Client } from 'discord.js';
import { Database } from '../shared/Database';

export default {
  interval: 3.6e6,
  firstRun: true,

  handler: async (context: Client) => {
    await Database.pruneOldMessages();
  }
}
