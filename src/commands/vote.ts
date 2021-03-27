import { getCustomRepository, getRepository } from "typeorm";
import { CommandAction, CommandHandler } from "../commandHandler";
import { Vote } from "../models/vote";
import { TourRepository } from "../repositories/tour.repository";
import { askQuestion } from "../utils/ask-question";
import getCurrentPoll from "../utils/get-current-poll";

export const commandName = "vote";

export const description = "Vote pour le tour actuel ! ";

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  originalMessage
) {
  const repo = getCustomRepository(TourRepository);
  const voteRepo = getRepository(Vote);
  const currentPoll = await getCurrentPoll();

  if (!currentPoll) {
    throw new Error("Aucun sondage n'est en cours !");
  }

  const lastTour = await repo
    .createQueryBuilder("tour")
    .leftJoinAndSelect("tour.poll", "poll")
    .leftJoinAndSelect("tour.votePropositions", "votePropositions")
    .leftJoinAndSelect("votePropositions.proposition", "proposition")
    .where("tour.pollId = :pollId", { pollId: currentPoll.id })
    .orderBy("tour.number", "DESC")
    .getSql();

  console.log(lastTour);

  // if (!lastTour) {
  //   throw new Error("Aucun tour n'a encore été posté :(");
  // }

  // console.log(lastTour);

  // const response = await askQuestion(
  //   `Voici les différentes propositions de la semaine :\n${lastTour.votePropositions.map(
  //     (e, i) => `-${i} : ${e.proposition.name}`
  //   )}\nVeuillez faire votre choix (ex : 1) !\nSi plusieurs choix séparer par une virgule comme ceci : (ex : 1,2,3,4)`,
  //   originalMessage.author!,
  //   30000
  // );

  // for (const code of response.split(",")) {
  //   const voteProposition = lastTour.votePropositions[parseInt(code, 10)];
  //   const vote = voteRepo.create({
  //     voteProposition,
  //     clientId: originalMessage.member!.id,
  //   });
  //   await voteRepo.save(vote);
  // }

  // await originalMessage.reply("Votre vote a été comptabilisé !");
};
