import { MessageEmbed } from "discord.js";
import {
  CommandAction,
  CommandHandler,
  CommandListen,
} from "../commandHandler";
import { randomImage } from "../utils/random-food";

export const commandName = "food";

export const description = "J'ai faim";

export const listen: CommandListen = "@guilds";

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  channel,
  caller
) {
  const photos = await randomImage();

  await channel.send({ files: [photos[0].src.large] });
};
