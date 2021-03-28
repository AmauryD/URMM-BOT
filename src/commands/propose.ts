import { Guild, TextChannel } from "discord.js";
import { getRepository } from "typeorm";
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
  const propositionRepo = getRepository(
    Proposition
  )!;

  const propositionName = args.getRemaining();

  const isTooFast = await propositionRepo.createQueryBuilder("prop")
    .select()
    .where("prop.clientId = :clientId",{clientId :originalMessage.author.id})
    .andWhere("prop.createdAt >= DATE_SUB(NOW(),INTERVAL 1 DAY)")
    .groupBy("prop.clientId")
    .getCount();

  if (isTooFast > 2) {
    throw new Error("Vous ne pouvez faire que 2 propositions par jour !");
  }

  if (propositionName && propositionName?.trim()) {
    const prop = await propositionRepo.findOne({ name: propositionName });

    if (prop !== undefined) {
      throw new Error("Cette proposition existe déjà !");
    }

    const proposition = propositionRepo.create({
      name: propositionName,
      clientId: originalMessage.author.id
    });

    await propositionRepo.save(proposition);

    await originalMessage.reply("📌 Proposition ajoutée !");
  } else {
    throw new Error("Veuillez indiquer un nom de proposition.");
  }
};
