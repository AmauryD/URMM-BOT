import {
  MessageAttachment,
  MessageEmbed,
  User as DiscordUser,
  User,
} from "discord.js";
import { getCustomRepository, getRepository } from "typeorm";
import {
  AccessFunction,
  CommandAction,
  CommandHandler,
} from "../command-handler";
import { Poll, PollStatus } from "../models/poll";
import { Proposition, PropositionState } from "../models/proposition";
import { TourType } from "../models/tour";
import { DiscordServer as DiscordServer } from "../models/server";
import { VoteProposition } from "../models/vote-proposition";
import { TourRepository } from "../repositories/tour-repository";
import { askConfirmation, askQuestion } from "../utils/ask-question";
import { ChartService } from "../utils/chart-service";
import getCurrentPoll from "../utils/get-current-poll";
import stc from "string-to-color";
import { isAdmin } from "../utils/is-admin";
import { publishMessageOnEveryServers } from "../utils/publish";
import { TourMessage } from "../models/tour-message";
import { DiscordClient } from "../discord-client";
import { MessageArgumentReader } from "discord-command-parser";
import { listenToTourReactions } from "../utils/listen-tour-message";
import { DiscordServerRepository } from "../repositories/server-repository";

export const commandName = "start-tour";

export const description = "Commence un nouveau tour !";

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
  const propoRepo = getRepository(Proposition);
  const votePropRepo = getRepository(VoteProposition);
  const tourMessageRepo = getRepository(TourMessage);
  const pollRepo = getRepository(Poll);
  let currentPoll = await getCurrentPoll();

  if (!currentPoll) {
    const response = await askConfirmation(
      "Aucun sondage n'est en cours, voulez-vous en lancer un ?",
      channel,
      caller
    );

    if (!response) {
      return;
    }

    const name = await askQuestion(
      "Donnez un petit nom au sondage ;)",
      channel,
      caller
    );

    currentPoll = await pollRepo.save(
      pollRepo.create({
        name: name.content,
        status:
          process.env.NODE_ENV === "test"
            ? PollStatus.Draft
            : PollStatus.Active,
      })
    );
  }

  const lastTour = await repo
    .createQueryBuilder("tour")
    .innerJoinAndSelect("tour.poll", "poll")
    .leftJoinAndSelect("tour.votePropositions", "votePropositions")
    .leftJoinAndSelect("votePropositions.votes", "votes")
    .leftJoinAndSelect("votePropositions.proposition", "proposition")
    .where("tour.pollId = :pollId", { pollId: currentPoll.id })
    .orderBy("tour.number", "DESC")
    .getOne();

  if (lastTour) {
    if (lastTour.isFinal) {
      throw new Error(
        "Vous ne pouvez créer de nouveaux tours pour cette session, celui-ci a été marqué comme final."
      );
    }

    const response = await askConfirmation(
      `La création d'un nouveau tour va engendrer la publication des résultats de l'ancien,voulez-vous vraiment clore le tour précédent ? `,
      channel,
      caller
    );

    if (!response) {
      return;
    }

    const embed = new MessageEmbed()
      .setColor(stc(currentPoll.name))
      .setTitle(currentPoll.name)
      .setDescription(`💥 Voici les résultats du tour précédent ! 💥`)
      .addField(
        `🕴 ${lastTour.votePropositions.length} Votants`,
        `Merci à vous chers votants, que la force vous guide !`
      )
      .attachFiles([
        new MessageAttachment(await ChartService.generateChart(lastTour)),
      ])
      .setTimestamp();

    await channel.send("📝 Résultats publiés !");

    await publishMessageOnEveryServers(embed);
  }

  const propositions = await propoRepo
    .createQueryBuilder("proposition")
    .leftJoinAndSelect("proposition.pollWinner", "pollWinner")
    .where("pollWinner.winnerId IS NULL")
    .andWhere(`proposition.state = '${PropositionState.VALIDATED}'`)
    .getMany();

  let newTour = repo.create({
    poll: currentPoll,
    number: lastTour ? lastTour.number + 1 : 1,
  });

  const isFinalTour = await askConfirmation(
    `Ce nouveau tour est-il le tour final ?`,
    channel,
    caller
  );

  if (isFinalTour) {
    await channel.send("✅ Enregistré comme tour final !");
    newTour.isFinal = true;
  }

  const isMulti = await askConfirmation(
    `Ce tour authorise-t-il qu'une seule réponse à la fois (multi par défaut) ?`,
    channel,
    caller
  );

  if (isMulti) {
    await channel.send("✅ Enregistré comme tour à réponses uniques !");
    newTour.type = TourType.Single;
  } else {
    await channel.send("✅ Enregistré comme tour à réponses multiples !");
    newTour.type = TourType.Multiple;
  }

  newTour = await repo.save(newTour);

  const propositionsArray =
    lastTour?.votePropositions.map((e) => e.proposition) ?? propositions;

  const propositionString = await askQuestion(
    `Quelles propositions doivent être dans ce tour ? (ex: 1,2,3)\n${propositionsArray
      .map((e, i) => `🔹 ${i} : ${e.name}`)
      .join("\n")}`,
    channel,
    caller
  );

  const indexes = propositionsArray.map((e, i) => i);
  const chosen = propositionString.content
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e !== "");

  if (chosen.length === 0) {
    throw new Error("Vous devez proposer quelque chose !");
  }

  if (chosen.some((e) => !indexes.includes(parseInt(e, 10)))) {
    throw new Error("Vous devez choisir une proposition valide !");
  }

  const chosenArrayObject: VoteProposition[] = [];

  for (const nbrString of chosen) {
    chosenArrayObject.push(
      await votePropRepo.save({
        proposition: propositionsArray[parseInt(nbrString, 10)],
        tour: newTour,
        votes: [],
      })
    );
  }

  newTour.votePropositions = chosenArrayObject;

  const loveMessage = await askQuestion(
    `Petit message d'amour pour le tour ! (vous pouvez également joindre une image à ce message qui sera affichée en tant que bannière)`,
    channel,
    caller,
    120000
  );

  const embed = new MessageEmbed()
    .setColor(stc(currentPoll.name))
    .setTitle(currentPoll.name)
    .setDescription(`🥳 **Nouveau tour @everyone !** 🥳`)
    .addField(
      "Description",
      `Nous sommes maintenant au tour n°${newTour.number} !\n`
    )
    .addField(
      "Réactions",
      `Cliquez sur '🗳' pour voter !\nCliquez sur '📊' pour voir les résultats !\nCliquez sur '❓' pour afficher les commandes !\n`
    )
    .attachFiles([
      new MessageAttachment(await ChartService.generateChart(newTour)),
    ])
    .setTimestamp();

  if (loveMessage.content.trim()) {
    embed.addField("❤️ Message d'amour ❤️", loveMessage.content);
  }

  if (loveMessage.attachments.size > 0) {
    embed.setThumbnail(loveMessage.attachments.first()!.url);
  }

  const announcementArray = await publishMessageOnEveryServers(embed);

  for (const announcement of announcementArray) {
    const tourMessage = new TourMessage();
    tourMessage.server = announcement.server;
    tourMessage.messageId = announcement.message.id;
    tourMessage.tour = newTour;

    await tourMessageRepo.save(tourMessage);

    await listenToTourReactions(announcement.message);
  }

  await channel.send("📝 Tour publié !");
};
