import { MessageEmbed } from "discord.js";
import {
  CommandAction,
  CommandHandler,
  CommandListen,
} from "../commandHandler";
import { randomImage } from "../utils/random-image";

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
    const photos = await randomImage([args.body], 10);
    await channel.send({ files: [photos[0].src.large] });
  } else {
    throw new Error("Veuillez faire une recherche avec un mot clé");
  }
};
