import { Client } from 'discord.js';
import { checkExpiredBans } from '../utils';
import { Task } from '../types';

const task: Task = {
  interval: 300000,
  firstRun: true,
  
  handle: async (context: Client) => {
    await checkExpiredBans(context);
  },
}

export default task;