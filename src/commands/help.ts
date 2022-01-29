import { MessageEmbed } from "discord.js";
import { BotConfig } from "../bot-config";
import { CommandAction, CommandHandler } from "../command-handler";

export const commandName = "help";

export const description = "Obtenir de l'aide";

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  channel,
  caller
) {
  const commands = await Promise.all(
    Object.values(this._commands).map(async (c) => {
      if (c.access === undefined) return c;

      if (await c.access(caller, channel)) {
        return c;
      } else {
        return null;
      }
    })
  );

  const prefix = BotConfig.config.commandPrefix;

  const embed = new MessageEmbed()
    .setTitle("📜 Liste des commandes")
    .addField(
      "En privé",
      commands
        .filter((c) => {
          return c !== null && c.listen === "@dm";
        })
        .map((mod) => {
          return `• \`${prefix}${mod!.commandName}\` - ${mod!.description}`;
        })
        .join("\n")
    )
    .addField(
      "Dans un channel public",
      commands
        .filter((c) => {
          return c !== null && c.listen === "@guilds";
        })
        .map((mod) => {
          return `• \`${prefix}${mod!.commandName}\` - ${mod!.description}`;
        })
        .join("\n")
    );

  await channel.send({embeds: [embed]});
};
