import { DMChannel, MessageAttachment, MessageEmbed, TextChannel } from "discord.js";
import { getCustomRepository, getRepository } from "typeorm";
import { CommandAction, CommandHandler } from "../commandHandler";
import { Poll } from "../models/poll";
import { Proposition } from "../models/proposition";
import { TourType } from "../models/tour";
import { VoteProposition } from "../models/vote-proposition";
import { TourRepository } from "../repositories/tour.repository";
import { askQuestion } from "../utils/ask-question";
import { ChartService } from "../utils/chart-service";
import getCurrentPoll from "../utils/get-current-poll";
import stc from "string-to-color";

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
    .leftJoinAndSelect("votePropositions.proposition", "proposition")
    .where("tour.pollId = :pollId", { pollId: currentPoll.id })
    .orderBy("tour.number", "DESC")
    .getOne();

  if (lastTour) {
    if (lastTour.isFinal) {
      throw new Error("Vous ne pouvez créer de nouveaux tours pour cette session, celui-ci a été marqué comme final.");
    }

    const response = await askQuestion(
      `La création d'un nouveau tour va engendrer la publication des résultats de l'ancien,voulez-vous vraiment clore le tour précédent ? (y/n)`,
      originalMessage.author!
    );

    if (response === "n") {
      return;
    }

    const embed = new MessageEmbed()
      .setColor(stc(currentPoll.name))
      .setTitle(currentPoll.name)
      .setDescription(`💥 Voici les résultats du tour précédent ! 💥`)
      .addField(`🕴 ${lastTour.votePropositions.length} Votants`, `Merci à vous chers votants, que la force vous guide !`)
      .attachFiles([
        new MessageAttachment(await ChartService.generateChart(lastTour))
      ])
      .setTimestamp();

    await (originalMessage.channel! as TextChannel).send(embed);
  }

  const propositions = await propoRepo
    .createQueryBuilder("proposition")
    .leftJoinAndSelect("proposition.pollWinner", "pollWinner")
    .where("pollWinner.winnerId IS NULL")
    .getMany();
    
  let newTour = repo.create({
    poll: currentPoll,
    number: lastTour ? lastTour.number + 1 : 1
  });

  const isFinalTour = await askQuestion(
    `Ce nouveau tour est-il le tour final ? (y/n)`,
    originalMessage.author!
  );

  if (isFinalTour === "y") {
    await originalMessage.reply("✅ Enregistré comme tour final !");
    newTour.isFinal = true;
  }

  const isMulti = await askQuestion(
    `Ce tour authorise-t-il qu'une seule réponse à la fois (multi par défaut) ? (y/n)`,
    originalMessage.author!
  );

  if (isMulti === "y") {
    await originalMessage.reply("✅ Enregistré comme tour à réponses uniques !");
    newTour.type = TourType.Single;
  }else{
    await originalMessage.reply("✅ Enregistré comme tour à réponses multiples !");
    newTour.type = TourType.Multiple;
  }

  newTour = await repo.save(newTour);

  const propositionsArray = lastTour?.votePropositions.map((e) => e.proposition) ?? propositions;

  const propositionString = await askQuestion(
    `Quelles propositions doivent être dans ce tour ? (ex: 1,2,3)\n${propositionsArray.map(
      (e, i) => `🔹 ${i} : ${e.name}`
    ).join("\n")}`,
    originalMessage.author
  );
    
  const indexes = propositionsArray.map((e,i) => i);
  const chosen = propositionString.split(",").map(e => e.trim()).filter((e) => e !== "");

  if (chosen.length === 0) {
    throw new Error("Vous devez proposer quelque chose !");
  }

  if (chosen.some((e) => !indexes.includes(parseInt(e,10)))) {
    throw new Error("Vous devez choisir une proposition valide !");
  }

  const chosenArrayObject : VoteProposition[] = [];

  for (const nbrString of chosen) {
    chosenArrayObject.push(await votePropRepo.save({
      proposition: propositions[parseInt(nbrString, 10)],
      tour: newTour,
      votes : []
    }));
  }

  newTour.votePropositions = chosenArrayObject;

  const embed = new MessageEmbed()
    .setColor(stc(currentPoll.name))
    .setTitle(currentPoll.name)
    .setDescription(`🥳 **Nouveau tour !** 🥳`)
    .addField("Description",`Nous sommes maintenant au tour ${newTour.number} !`)
    .attachFiles([
      new MessageAttachment(await ChartService.generateChart(newTour))
    ])
    .setTimestamp();

  await (originalMessage.channel as DMChannel).send(embed);

  await originalMessage.reply("📝 Tour publié !");
};
