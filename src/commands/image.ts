import { MessageEmbed } from "discord.js";
import {
  CommandAction,
  CommandHandler,
  CommandListen,
} from "../command-handler";
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
    if (!photos.length) {
      throw new Error("Aucun résultat n'a été trouvé");
    }
    await channel.send({ files: [photos[0].src.large] });
  } else {
    throw new Error("Veuillez faire une recherche avec un mot clé");
  }
};
