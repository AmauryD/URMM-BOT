import { BotConfig } from "../bot-config";
import { CommandAction, CommandHandler } from "../commandHandler";

export const commandName = "publish";

export const description = "Publie une URL de strawpoll";

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  originalMessage
) {
  originalMessage.reply("hello");
};
