import { DMChannel, GuildMember, MessageAttachment, MessageEmbed, User as DiscordUser } from "discord.js";
import { getCustomRepository, getRepository } from "typeorm";
import { AccessFunction, CommandAction, CommandHandler } from "../commandHandler";
import { PollStatus } from "../models/poll";
import { Proposition } from "../models/proposition";
import { VoteProposition } from "../models/vote-proposition";
import { PollRepository } from "../repositories/poll.repository";
import { TourRepository } from "../repositories/tour.repository";
import { askQuestion } from "../utils/ask-question";
import { ChartService } from "../utils/chart-service";
import getCurrentPoll from "../utils/get-current-poll";
import stc from "string-to-color";
import { isAdmin } from "../utils/is-admin";
import { publishMessageOnEveryServers } from "../utils/publish";

export const commandName = "close-poll";

export const description = "Arrête le concours de la semaine";

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

  const customMessage = await askQuestion(
    "Oyez oyez, veuillez indiquer votre message customisé d'amour qui apparaîtra après mes résultats",
    originalMessage.author!
  );

  const lastTour = await repo.getLastTour(currentPoll.id);

  if (!lastTour) {
    throw new Error("Il n'y a pas de tour actif dans ce poll");
  }

  const [winner] = lastTour.votePropositions
    .sort((a,b) => {
        return b.votes.length - a.votes.length;
    });

  currentPoll.winner = winner.proposition; 
  currentPoll.status = PollStatus.Finished;
  await pollRepo.save(currentPoll);

  const embed = new MessageEmbed()
    .setColor(stc(winner.proposition.name))
    .setTitle(currentPoll.name)
    .setDescription(`🥳 **Le thème gagnant de la semaine est ${winner.proposition.name}** 🥳`)
    .addField('Description', `Cette proposition a été proposée par ${winner.proposition.clientId ? `<@${winner.proposition.clientId}>` : "Un Inconnu"} !`)
    .addField('Petit message', customMessage)
    .attachFiles([
      new MessageAttachment(await ChartService.generateChart(lastTour))
    ])
    .setTimestamp();

  await publishMessageOnEveryServers(embed);
};
