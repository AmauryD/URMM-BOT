import { DMChannel, MessageAttachment, MessageEmbed, TextChannel } from "discord.js";
import { getCustomRepository, getRepository } from "typeorm";
import { CommandAction, CommandHandler } from "../commandHandler";
import { DiscordClient } from "../discordclient";
import { PollStatus } from "../models/poll";
import { Proposition } from "../models/proposition";
import { VoteProposition } from "../models/vote-proposition";
import { PollRepository } from "../repositories/poll.repository";
import { TourRepository } from "../repositories/tour.repository";
import { askQuestion } from "../utils/ask-question";
import { ChartService } from "../utils/chart-service";
import getCurrentPoll from "../utils/get-current-poll";
import stc from "string-to-color";

export const commandName = "close-poll";

export const description = "Arrête le concours de la semaine";

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  originalMessage
) {
  const repo = getCustomRepository(TourRepository);
  const propoRepo = getRepository(Proposition);
  const pollRepo = getCustomRepository(PollRepository);
  const votePropRepo = getRepository(VoteProposition);
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

  await (originalMessage.channel as DMChannel).send(embed);
};
