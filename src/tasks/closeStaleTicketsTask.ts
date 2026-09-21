import { Client } from 'discord.js';
import { closeOldTickets } from '../utils';
import { Task } from '../types';

const task: Task = {
  interval: 3.6e6,
  firstRun: true,
  
  handle: async (context: Client) => {
    await closeOldTickets(context);
  },
};

export default task;
