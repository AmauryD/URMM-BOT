import {
  MessageAttachment,
  MessageEmbed,
  User as DiscordUser,
} from "discord.js";
import { getCustomRepository } from "typeorm";
import {
  AccessFunction,
  CommandAction,
  CommandHandler,
} from "../command-handler";
import { PollStatus } from "../models/poll";
import { PollRepository } from "../repositories/poll-repository";
import { TourRepository } from "../repositories/tour-repository";
import { askQuestion } from "../utils/ask-question";
import { ChartService } from "../utils/chart-service";
import getCurrentPoll from "../utils/get-current-poll";
import stc from "string-to-color";
import { isAdmin } from "../utils/is-admin";
import { publishMessageOnEveryServers } from "../utils/publish";

export const commandName = "end-poll";

export const description =
  "Met fin au concours de la semaine en publiant des résultats !";

export const access: AccessFunction = (client: DiscordUser) => {
  return isAdmin(client);
};

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  channel,
  caller
) {
  const repo = getCustomRepository(TourRepository);
  const pollRepo = getCustomRepository(PollRepository);
  const currentPoll = await getCurrentPoll();

  if (!currentPoll) {
    throw new Error("Aucun sondage n'est en cours ! :(");
  }

  const customMessage = await askQuestion(
    "Oyez oyez, veuillez indiquer votre message customisé d'amour qui apparaîtra après mes résultats",
    channel,
    caller
  );

  const lastTour = await repo.getLastTour(currentPoll.id);

  if (!lastTour) {
    throw new Error("Il n'y a pas de tour actif dans ce poll");
  }

  const [winner] = lastTour.votePropositions.sort((a, b) => {
    return b.votes.length - a.votes.length;
  });

  currentPoll.winner = winner.proposition;
  currentPoll.status = PollStatus.Finished;
  await pollRepo.save(currentPoll);

  const embed = new MessageEmbed()
    .setColor(stc(winner.proposition.name))
    .setTitle(currentPoll.name)
    .setDescription(
      `@everyone 🥳 **Le thème gagnant de la semaine est ${winner.proposition.name}** 🥳`
    )
    .addField(
      "Description",
      `Cette proposition a été proposée par ${
        winner.proposition.clientId
          ? `<@${winner.proposition.clientId}>`
          : "Un Inconnu"
      } !`
    )
    .addField("Petit message", customMessage)
    .attachFiles([
      new MessageAttachment(await ChartService.generateChart(lastTour)),
    ])
    .setTimestamp();

  await publishMessageOnEveryServers(embed);
};
