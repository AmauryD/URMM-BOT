import { Guild, TextChannel } from "discord.js";
import { BotConfig } from "../bot-config";
import { CommandAction, CommandHandler } from "../commandHandler";
import { DatabaseConnection } from "../db-connection";
import { DiscordClient } from "../discordclient";
import { Proposition } from "../models/proposition";

export const commandName = "propose";

export const description = "Propose un dessin animé !";

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  originalMessage
) {
  const propositionRepo = DatabaseConnection.Connection?.getRepository(
    Proposition
  )!;

  const propositionName = args.getRemaining();

  if (propositionName && propositionName?.trim()) {
    const prop = await propositionRepo.findOne({ name: propositionName });

    if (prop !== undefined) {
      throw new Error("Cette proposition existe déjà !");
    }

    const proposition = propositionRepo.create({
      name: propositionName,
    });

    await propositionRepo.save(proposition);

    await originalMessage.reply("Proposition ajoutée !");
  } else {
    throw new Error("Veuillez indiquer un nom de proposition.");
  }
};
