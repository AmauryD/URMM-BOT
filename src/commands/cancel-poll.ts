import { DMChannel, GuildMember, MessageAttachment, MessageEmbed, User as DiscordUser } from "discord.js";
import { getCustomRepository, getRepository } from "typeorm";
import { AccessFunction, CommandAction, CommandHandler } from "../commandHandler";
import { PollStatus } from "../models/poll";
import { Proposition } from "../models/proposition";
import { VoteProposition } from "../models/vote-proposition";
import { PollRepository } from "../repositories/poll.repository";
import { TourRepository } from "../repositories/tour.repository";
import { ChartService } from "../utils/chart-service";
import getCurrentPoll from "../utils/get-current-poll";
import stc from "string-to-color";
import { isAdmin } from "../utils/is-admin";
import { publishMessageOnEveryServers } from "../utils/publish";
import { askQuestion } from "../utils/ask-question";

export const commandName = "cancel-poll";

export const description = "Annule le concours de la semaine";

export const access : AccessFunction = (client: DiscordUser) => {
  return isAdmin(client);
}

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  originalMessage
) {
  const repo = getCustomRepository(TourRepository);
  const pollRepo = getCustomRepository(PollRepository);
  const currentPoll = await getCurrentPoll();

  if (!currentPoll) {
    throw new Error("Aucun sondage n'est en cours ! :(");
  }

  const response = await askQuestion(
    `Êtes-vous sûr ? (y/n)`,
    originalMessage,
    30000
  );

  if (response === "y") {
    // aborded
    currentPoll.status = PollStatus.Closed;
    await pollRepo.save(currentPoll);
    await originalMessage.reply("Le dernier sondage a été annulé !");
  }
};
