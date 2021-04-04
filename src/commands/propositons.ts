import { MessageEmbed } from "discord.js";
import { CommandAction, CommandHandler } from "../commandHandler";
import { DatabaseConnection } from "../db-connection";
import { Proposition } from "../models/proposition";

export const commandName = "propositions";

export const description = "Liste des propositions !";

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  originalMessage
) {
  const propositionRepo = DatabaseConnection.Connection?.getRepository(
    Proposition
  )!;

  const propositions = await propositionRepo
    .createQueryBuilder("proposition")
    .select()
    .leftJoinAndSelect("proposition.pollWinner", "pollWinner")
    .where("pollWinner.winnerId IS NULL")
    .andWhere("proposition.state = 'validated'")
    .getMany();

    const embed = new MessageEmbed()
      .setTitle("📋 Sujets proposés")
      .setDescription(propositions.map((p) => `🔹 ${p.name}`).join("\n"));

  await originalMessage.reply(embed);
};
