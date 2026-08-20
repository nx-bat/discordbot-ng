import { AnyThreadChannel } from 'discord.js';

export default {
  event: 'threadCreate',

  handler: async (thread: AnyThreadChannel, newlyCreated: boolean) => {
    await thread.join();
  }
};
