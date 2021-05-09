import { MessageEmbed } from "discord.js";
import { CommandAction, CommandHandler } from "../commandHandler";

export const commandName = "help";

export const description = "Obtenir de l'aide";

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  originalMessage
) {
  const commands = await Promise.all(
    Object.values(this._commands).map(async (c) => {
      if (c.access === undefined) return c;

      if (await c.access(originalMessage.author, originalMessage)) {
        return c;
      } else {
        return null;
      }
    })
  );

  const embed = new MessageEmbed()
    .setTitle("📜 Liste des commandes")
    .setDescription(
      commands
        .filter((c) => {
          return c !== null && c.listen === "@dm";
        })
        .map((mod) => {
          return `• \`$${mod!.commandName}\` - ${mod!.description}`;
        })
        .join("\n")
    );

  await originalMessage.reply(embed);
};
