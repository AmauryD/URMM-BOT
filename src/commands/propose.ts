import { getRepository } from "typeorm";
import { CommandAction, CommandHandler } from "../commandHandler";
import { Proposition, PropositionState } from "../models/proposition";
import { isAdmin } from "../utils/is-admin";

export const commandName = "propose";

export const description = "Propose un thème ! ($propose <theme>)";

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  channel,
  caller
) {
  const propositionRepo = getRepository(
    Proposition
  )!;

  const propositionName = args.getRemaining();

  const isTooFast = await propositionRepo.createQueryBuilder("prop")
    .select()
    .where("prop.clientId = :clientId",{clientId : caller.id})
    .andWhere("prop.createdAt >= DATE_SUB(NOW(),INTERVAL 1 DAY)")
    .groupBy("prop.clientId")
    .getCount();

  const isAd = await isAdmin(caller);

  if (isTooFast > 10 && !isAd) {
    throw new Error("Vous ne pouvez faire que 2 propositions par jour !");
  }

  if (propositionName && propositionName?.trim()) {
    const prop = await propositionRepo.findOne({ name: propositionName });

    if (prop !== undefined) {
      if (prop.state === PropositionState.DENIED) {
        throw new Error(`Cette proposition a été refusé car : ${prop.note}`);
      } else {
        throw new Error("Cette proposition existe déjà !");
      }
    }

    const proposition = propositionRepo.create({
      name: propositionName,
      clientId: caller.id
    });

    await propositionRepo.save(proposition);

    await channel.send("📌 Proposition ajoutée !");
  } else {
    throw new Error("Veuillez indiquer un nom de proposition.");
  }
};
