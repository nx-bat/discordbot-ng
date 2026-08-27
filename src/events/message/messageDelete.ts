import { Message, PartialMessage } from 'discord.js';
import { Database } from '../../shared/Database';
import { logDeletion } from '../../utils';

export default {
  event: 'messageDelete',

  handler: async (message: Message | PartialMessage) => {
    const loggedMessage = await Database.getMessageWithRetry(message.id);
    if (!loggedMessage) return;

    await Database.removeMessge(message.id);

    if (message.inGuild()) await logDeletion(loggedMessage, message);
  }
};
