import { publishMessageOnEveryServers } from "../utils/publish";
import { BotConfig } from "../bot-config";
import { AccessFunction, CommandAction, CommandHandler } from "../commandHandler";
import { MessageEmbed, User as DiscordUser } from "discord.js";
import { isAdmin } from "../utils/is-admin";

export const commandName = "publish";

export const description = "Publie une annonce dans tous les serveurs";

export const access : AccessFunction = (client: DiscordUser) => {
  return isAdmin(client);
}

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  originalMessage
) {
  const messageContent = args.body;

  const embed = new MessageEmbed()
    .setColor("#0095cb")
    .setTitle("📋 Annonce")
    .setDescription(messageContent)
    .attachFiles(originalMessage.attachments.array());

  await publishMessageOnEveryServers(embed);

  await originalMessage.delete();
};
