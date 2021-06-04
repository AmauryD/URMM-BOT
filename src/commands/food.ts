import { MessageEmbed } from "discord.js";
import {
  CommandAction,
  CommandHandler,
  CommandListen,
} from "../commandHandler";
import { all } from "../static/food-keywords";
import { randomImage } from "../utils/random-image";

export const commandName = "food";

export const description = "J'ai faim";

export const listen: CommandListen = "@guilds";

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  channel,
  caller
) {
  const photos = await randomImage(all);
  if (!photos.length) return;
  await channel.send({ files: [photos[0].src.large] });
};
