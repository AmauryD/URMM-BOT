import { MessageEmbed } from "discord.js";
import {
  CommandAction,
  CommandHandler,
  CommandListen,
} from "../commandHandler";
import { randomImage } from "../utils/random-food";

export const commandName = "image";

export const description = "Une image pls";

export const listen: CommandListen = "@guilds";

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  channel,
  caller
) {
  if (args.body) {
    const photos = await randomImage([args.body]);
    await channel.send({ files: [photos[0].src.large] });
  }
};
