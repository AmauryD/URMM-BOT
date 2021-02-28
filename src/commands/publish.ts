import { Guild, TextChannel } from "discord.js";
import { BotConfig } from "../bot-config";
import { CommandAction, CommandHandler } from "../commandHandler";
import { DiscordClient } from "../discordclient";

export const commandName = "publish";

export const description = "Publie une URL de strawpoll";

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  originalMessage
) {
  if (originalMessage.client.user?.id === "813478558307057734") {
    const messageContent = args.body;

    for (const g of DiscordClient.instance.guilds.cache.values()) {
      const channel = g.channels.cache.find(
        (c) => c.name === "urmm-bot" && c.type === "text"
      ) as TextChannel;
      if (channel) {
        await channel.send(messageContent);
      }
    }

    await originalMessage.channel.send(messageContent);
  }
  await originalMessage.delete();
};
