import { Guild, TextChannel } from "discord.js";
import { BotConfig } from "../bot-config";
import { CommandAction, CommandHandler } from "../commandHandler";
import { DatabaseConnection } from "../db-connection";
import { DiscordClient } from "../discordclient";
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
    .getMany();

  await originalMessage.reply(propositions.map((p) => `🔹 ${p.name}`).join("\n"));
};
