import { getCustomRepository, getRepository } from "typeorm";
import { CommandAction, CommandHandler } from "../commandHandler";
import { Poll } from "../models/poll";
import { Proposition } from "../models/proposition";
import { VoteProposition } from "../models/vote-proposition";
import { TourRepository } from "../repositories.ts/tour.repository";
import { askQuestion } from "../utils/ask-question";
import getCurrentPoll from "../utils/get-current-poll";

export const commandName = "start-tour";

export const description = "Commence un nouveau tour !";

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  originalMessage
) {
  const repo = getCustomRepository(TourRepository);
  const propoRepo = getRepository(Proposition);
  const votePropRepo = getRepository(VoteProposition);
  const pollRepo = getRepository(Poll);
  let currentPoll = await getCurrentPoll();

  if (!currentPoll) {
    const response = await askQuestion(
      "Aucun sondage n'est en cours, voulez-vous en lancer un ? (y/n)",
      originalMessage.author!
    );

    if (response === "n") {
      return;
    }

    const name = await askQuestion(
      "Donnez un petit nom au sondage ;)",
      originalMessage.author!
    );

    currentPoll = await pollRepo.save(
      pollRepo.create({
        name,
      })
    );
  }

  const lastTour = await repo
    .createQueryBuilder("tour")
    .innerJoinAndSelect("tour.poll", "poll")
    .leftJoinAndSelect("tour.votePropositions", "votePropositions")
    .leftJoinAndSelect("votePropositions.votes", "votes")
    .where("tour.pollId = :pollId", { pollId: currentPoll.id })
    .orderBy("tour.number", "DESC")
    .getOne();

  if (lastTour) {
    const response = await askQuestion(
      `La création d'un nouveau tour va engendrer la publication des résultats de l'ancien,voulez-vous vraiment clore le tour précédent ? (y/n)`,
      originalMessage.author!
    );

    if (response === "n") {
      return;
    }

    const totalVotes = lastTour.votePropositions.reduce(
      (p, c) => p + c.votes.length,
      0
    );

    await originalMessage.reply(`Résultats de l'ancien vote :
      ${lastTour.votePropositions.map((e) => {
        return `${e.votes.length} / ${totalVotes}`;
      })})`);
  }

  const propositions = await propoRepo
    .createQueryBuilder("proposition")
    .leftJoinAndSelect("proposition.pollWinner", "pollWinner")
    .where("pollWinner.winnerId IS NULL")
    .getMany();

  const newTour = repo.create({
    poll: currentPoll,
    number: lastTour ? lastTour.number + 1 : 1,
  });

  await repo.save(newTour);

  const propositionString = await askQuestion(
    `Quelles propositions doivent être dans ce tour ? (ex: 1,2,3)\n${propositions.map(
      (e, i) => `- ${i} : ${e.name}\n`
    )}`,
    originalMessage.author!
  );

  for (const nbrString of propositionString.split(",")) {
    await votePropRepo.save({
      proposition: propositions[parseInt(nbrString, 10)],
      tour: newTour,
    });
  }

  await originalMessage.reply("Tour publié !");
};
