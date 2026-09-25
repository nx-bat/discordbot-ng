import { ClientEvents } from 'discord.js';

export abstract class Event<Context, E extends keyof ClientEvents> {
  abstract readonly event: E;
  execute(context: Context, ...args: ClientEvents[E]): Promise<void>;
}
