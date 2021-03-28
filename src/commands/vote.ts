import { getCustomRepository, getRepository } from "typeorm";
import { CommandAction, CommandHandler } from "../commandHandler";
import { TourType } from "../models/tour";
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
    .innerJoinAndSelect("tour.poll", "poll")
    .leftJoinAndSelect("tour.votePropositions", "votePropositions")
    .innerJoinAndSelect("votePropositions.proposition", "proposition")
    .where("tour.pollId = :pollId", { pollId: currentPoll.id })
    .orderBy("tour.number", "DESC")
    .getOne();

  if (!lastTour) {
    throw new Error("Aucun tour n'a encore été posté :(");
  }


  const hasVoted = await repo
    .createQueryBuilder("tour")
    .leftJoinAndSelect("tour.votePropositions", "votePropositions")
    .innerJoinAndSelect("votePropositions.votes", "votes")
    .where("tour.id = :tourId", {tourId: lastTour.id})
    .andWhere("votes.clientId = :client",{client: originalMessage.author!.id})
    .getOne();

  if (hasVoted) {
    throw new Error("Vous avez déjà voté :(");
  }

  if (lastTour.type === TourType.Single) {
    const response = await askQuestion(
      `⬇ Voici les différentes propositions de la semaine :\n${lastTour.votePropositions.map(
        (e, i) => `🔹 ${i} : ${e.proposition.name}`
      ).join("\n")}\nVeuillez faire votre choix (ex : 1) !\nCeci est à choix unique !`,
      originalMessage.author!,
      30000
    );

    const voteProposition = lastTour.votePropositions[parseInt(response, 10)];
    const vote = voteRepo.create({
      voteProposition,
      clientId: originalMessage.author!.id,
    });
    await voteRepo.save(vote);
  }else{
    const response = await askQuestion(
    `⬇ Voici les différentes propositions de la semaine :\n${lastTour.votePropositions.map(
      (e, i) => `🔹 ${i} : ${e.proposition.name}`
    ).join("\n")}\nVeuillez faire votre choix (ex : 1) !\nSi plusieurs choix séparer par une virgule comme ceci : (ex : 1,2,3,4)`,
    originalMessage.author!,
    30000
  );

  for (const code of response.split(",").map(r => r.trim())) {
    const voteProposition = lastTour.votePropositions[parseInt(code, 10)];
    const vote = voteRepo.create({
      voteProposition,
      clientId: originalMessage.author!.id,
    });
    await voteRepo.save(vote);
  }
  }

  await originalMessage.reply("✅ Votre vote a été comptabilisé !");
};
