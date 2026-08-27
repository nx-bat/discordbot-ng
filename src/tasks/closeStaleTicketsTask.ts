import { Client } from 'discord.js';
import { closeOldTickets } from '../utils';

export default {
  interval: 3.6e6,
  firstRun: true,

  handler: async (context: Client) => {
    await closeOldTickets(context);
  }
}
