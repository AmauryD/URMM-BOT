import { MessageEmbed } from "discord.js";
import stc from "string-to-color";
import { Any, getCustomRepository, getRepository } from "typeorm";
import { CommandAction, CommandHandler } from "../commandHandler";
import { TourType } from "../models/tour";
import { Vote } from "../models/vote";
import { VoteProposition } from "../models/vote-proposition";
import { TourRepository } from "../repositories/tour.repository";
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

  const embed = new MessageEmbed()
    .setColor(stc(currentPoll.name))
    .setTitle("💬 Votez !")
  if(lastTour.type === TourType.Multiple) embed.setDescription("Réagissez avec 📜 sur les suggestions de votre choix"); 
  else embed.setDescription("Réagissez avec 📜 sur la suggestion de votre choix (vous ne pouvez en choisir qu'une)");
  originalMessage.reply(embed);

  const propositions = [];  
  const votePropositionsIDs: { [name :string] : VoteProposition} = {};
  for (const voteProp of lastTour.votePropositions) {
      votePropositionsIDs[voteProp.proposition.name] = voteProp;
      const prop = await originalMessage.reply(voteProp.proposition.name);
      propositions.push(prop);
      await prop.react('📜');
  }

  const confirmEmbed = new MessageEmbed()
  .setColor(stc(currentPoll.name))
  .setTitle('Urne 🗳')
  .setDescription("Réagissez sur ce message avec ✅ une fois que vous avez fait votre choix :)");

  const confirm = await originalMessage.reply(confirmEmbed);
  await confirm.react('✅');
  //10 Minutes should be enough to choose and vote, i hope :/
  //Also, not bothering checking if user is the one who did $vote because he should be the only one able to react as it is the only other one in the channel
  await confirm.awaitReactions( (react,user) => react.emoji.name === '✅', { max: 1, time: 600000, errors: ['time'] });
  const chosen = [];
  const votes = [];
  for (const prop of propositions) {
    // Only checking count because as there is only 2 user in the channel (bot and user), if there's 2 reactions, the user must be the one who added the second reaction.
    if (prop.reactions.cache.get('📜')!.count === 2){
      const voteProposition = votePropositionsIDs[prop.content];
      chosen.push(prop.content);
      const vote = voteRepo.create({
        voteProposition,
        clientId: originalMessage.author.id,
      });
      votes.push(vote);
    }
    if (chosen.length > 1 && lastTour.type === TourType.Single) throw new Error("Vous ne pouviez voter que pour une suggestion :c\n Envoyez moi $vote pour recommencer :wink:");
  }
  //Saving after the loop so that a vote is not registered if there's multiple vote in a single type tour 
  await voteRepo.save(votes);

  const voteAck = new MessageEmbed()
      .setColor(stc(currentPoll.name))
      .setTitle(`✅ Votre vote pour [${chosen.join()}] a été comptabilisé !`)
      .setDescription("Utilisez la commande `$status` afin de voir les différents résultats.");

  await originalMessage.reply(voteAck);
};
