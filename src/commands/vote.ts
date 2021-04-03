import { MessageEmbed } from "discord.js";
import stc from "string-to-color";
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
    const embed = new MessageEmbed()
      .setColor(stc(currentPoll.name))
      .setTitle("💬 Votez !")
      .setDescription("Choisissez le chiffre correspondant à la proposition que vous voulez choisir !")
      .addField(`⬇ Propositions`,lastTour.votePropositions.map(
        (e, i) => `\t🔹 ${i} : ${e.proposition.name}`
      ).join("\n"))
      .addField("❔ Explications","Veuillez faire votre choix (ex : `1`) !\nCe tour est à réponse unique !");

    const response = await askQuestion(
      embed,
      originalMessage,
      120000
    );

    const voteProposition = lastTour.votePropositions[parseInt(response, 10)];
    const vote = voteRepo.create({
      voteProposition,
      clientId: originalMessage.author!.id,
    });
    await voteRepo.save(vote);
  }else{
    const indexes = lastTour.votePropositions.map((e,i) => i);

    const embed = new MessageEmbed()
      .setColor(stc(currentPoll.name))
      .setTitle("💬 Votez !")
      .setDescription("Choisissez les chiffres correspondants aux propositions que vous voulez choisir !")
      .addField(`⬇ Propositions`,lastTour.votePropositions.map(
        (e, i) => `\t🔹 ${i} : ${e.proposition.name}`
      ).join("\n"))
      .addField("❔ Explications","Veuillez faire votre choix (ex : `1`) !\nSi plusieurs choix séparer par une virgule comme ceci : (ex : `1,2,3,4`)");

    const response = await askQuestion(
      embed,
      originalMessage,
      120000
    );

    const chosen = response.split(",").map(r => r.trim()).filter((e) => e !== "");

    if (chosen.length === 0) {
      throw new Error("Vous devez proposer quelque chose !\nVeuillez revoter avec la commande `$vote`");
    }

    if (chosen.some((e) => !indexes.includes(parseInt(e,10)))) {
      throw new Error("Vous devez choisir une proposition valide !\nVeuillez revoter avec la commande `$vote`");
    }

    for (const code of chosen) {
      const voteProposition = lastTour.votePropositions[parseInt(code, 10)];
      const vote = voteRepo.create({
        voteProposition,
        clientId: originalMessage.author.id,
      });
      await voteRepo.save(vote);
    }
  }

  const embed = new MessageEmbed()
      .setColor(stc(currentPoll.name))
      .setTitle("✅ Votre vote a été comptabilisé !")
      .setDescription("Utilisez la commande `$status` afin de voir les différents résultats.");

  await originalMessage.reply(embed);
};
