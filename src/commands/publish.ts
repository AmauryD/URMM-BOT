import { publishMessageOnEveryServers } from "../utils/publish";
import { BotConfig } from "../bot-config";
import { CommandAction, CommandHandler } from "../commandHandler";
import { MessageEmbed } from "discord.js";

export const commandName = "publish";

export const description = "Publie une URL de strawpoll";

export const listen = () => {
  return BotConfig.config.publishChannel;
};

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  originalMessage
) {
  if (originalMessage.member?.roles.cache.find((v) => {
    return v.name.toUpperCase() === "BOT-MANAGER";
  })) {
    const messageContent = args.body;

    const embed = new MessageEmbed()
      .setColor("#0095cb")
      .setTitle("📋 Annonce")
      .setDescription(messageContent)
      .attachFiles(originalMessage.attachments.array());

    await publishMessageOnEveryServers(embed);
  }else{
    await originalMessage.reply("Vous n'avez pas des droits administrateur ou le rôle BOT-MANAGER");
  }
  await originalMessage.delete();
};
