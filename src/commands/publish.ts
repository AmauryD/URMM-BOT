import { Guild, TextChannel } from "discord.js";
import { getRepository } from "typeorm";
import { BotConfig } from "../bot-config";
import { CommandAction, CommandHandler } from "../commandHandler";
import { DiscordClient } from "../discordclient";
import { GuildMember } from "../models/server";

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

    for (const g of DiscordClient.instance.guilds.cache.values()) {
      const repository = getRepository(GuildMember);

      const server = await repository.findOne(g.id);

      if (server) {
        ((await DiscordClient.instance.channels.fetch(server.broadcastChannelId)) as TextChannel).send(messageContent);
      }
    }
  }else{
    await originalMessage.reply("Vous n'avez pas des droits administrateur :(");
  }
  await originalMessage.delete();
};
