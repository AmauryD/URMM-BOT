import { getCustomRepository, getRepository } from "typeorm";
import { CommandAction, CommandHandler } from "../commandHandler";
import { Poll } from "../models/poll";
import { Proposition } from "../models/proposition";
import { Vote } from "../models/vote";
import { VoteProposition } from "../models/vote-proposition";
import { TourRepository } from "../repositories/tour.repository";
import { askQuestion } from "../utils/ask-question";
import getCurrentPoll from "../utils/get-current-poll";

export const commandName = "startPoll";

export const description = "Crée un nouveau poll et clotûre l'actuel";

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  originalMessage
) {
  const repo = getCustomRepository(TourRepository);
  const propoRepo = getRepository(Proposition);
  const votePropRepo = getRepository(VoteProposition);
  const currentPoll = await getCurrentPoll();

  if (!currentPoll) {
    throw new Error("Aucun sondage n'est en cours ! :(");
  }

  const customMessage = await askQuestion(
    "Oyez oyez, veuillez indiquer votre message customisé d'amour qui apparaîtra avant mes résultats",
    originalMessage.member!
  );

  
};
