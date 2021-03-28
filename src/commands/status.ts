import { getCustomRepository } from "typeorm";
import { CommandAction, CommandHandler } from "../commandHandler";
import { TourRepository } from "../repositories/tour.repository";
import { ChartService } from "../utils/chart-service";
import getCurrentPoll from "../utils/get-current-poll";

export const commandName = "status";

export const description = "Commence un nouveau tour !";

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  originalMessage
) {
  const repo = getCustomRepository(TourRepository);

  let currentPoll = await getCurrentPoll();

  if (!currentPoll) {
    throw new Error("Aucun sondage n'est en cours !");
  }

  const currentTour = await repo
    .createQueryBuilder("tour")
    .innerJoinAndSelect("tour.poll", "poll")
    .leftJoinAndSelect("tour.votePropositions", "votePropositions")
    .leftJoinAndSelect("votePropositions.votes", "votes")
    .innerJoinAndSelect("votePropositions.proposition", "proposition")
    .where("tour.pollId = :pollId", { pollId: currentPoll.id })
    .orderBy("tour.number", "DESC")
    .getOne();

  if (!currentTour) {
     throw new Error("Aucun tour n'a encore été publié !");
  }

  const chartt = await ChartService.generateChart(currentTour);

  await originalMessage.reply("Voici ci dessous le joli graphique !",{
    files: [chartt]
  });
};
