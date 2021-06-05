import { MessageEmbed } from "discord.js";
import { getRepository } from "typeorm";
import { CommandAction, CommandHandler } from "../command-handler";
import { DatabaseConnection } from "../db-connection";
import { Proposition, PropositionState } from "../models/proposition";

export const commandName = "propositions";

export const description = "Liste des propositions !";

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  channel,
  caller
) {
  const propositionRepo = getRepository(Proposition);

  const propositions = await propositionRepo
    .createQueryBuilder("proposition")
    .select()
    .leftJoinAndSelect("proposition.pollWinner", "pollWinner")
    .where("pollWinner.winnerId IS NULL")
    .andWhere(`proposition.state = '${PropositionState.VALIDATED}'`)
    .getMany();

  const embed = new MessageEmbed()
    .setTitle("📋 Sujets proposés")
    .setDescription(propositions.map((p) => `🔹 ${p.name}`).join("\n"));

  await channel.send(embed);
};
