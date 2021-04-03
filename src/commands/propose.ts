import { getRepository } from "typeorm";
import { CommandAction, CommandHandler } from "../commandHandler";
import { Proposition } from "../models/proposition";
import { isAdmin } from "../utils/is-admin";

export const commandName = "propose";

export const description = "Propose un thème ! ($propose <theme>)";

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

  const isAd = await isAdmin(originalMessage.author);

  if (isTooFast > 2 && !isAd) {
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
