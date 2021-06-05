import { MessageAttachment, MessageEmbed } from "discord.js";
import { getCustomRepository } from "typeorm";
import { CommandAction, CommandHandler } from "../command-handler";
import { TourRepository } from "../repositories/tour-repository";
import { ChartService } from "../utils/chart-service";
import getCurrentPoll from "../utils/get-current-poll";
import stc from "string-to-color";
import { isAdmin } from "../utils/is-admin";

export const commandName = "status";

export const description =
  "Obtient les résultats actuels pour le tour en cours";

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  channel,
  user
) {
  const repo = getCustomRepository(TourRepository);

  const currentPoll = await getCurrentPoll();

  if (!currentPoll) {
    throw new Error("Aucun sondage n'est en cours !");
  }

  const currentTour = await repo
    .createQueryBuilder("tour")
    .innerJoinAndSelect("tour.poll", "poll")
    .leftJoinAndSelect("tour.votePropositions", "votePropositions")
    .leftJoinAndSelect("votePropositions.votes", "votes")
    .leftJoinAndSelect("votePropositions.proposition", "proposition")
    .where("tour.pollId = :pollId", { pollId: currentPoll.id })
    .orderBy("tour.number", "DESC")
    .getOne();

  if (!currentTour) {
    throw new Error("Aucun tour n'a encore été publié !");
  }

  if (currentTour.isFinal && !(await isAdmin(user))) {
    throw new Error("Vous ne pouvez voir les résultats lors du tour final !");
  }

  const numberOfVotants = await repo
    .createQueryBuilder("tour")
    .leftJoinAndSelect("tour.votePropositions", "votePropositions")
    .innerJoinAndSelect("votePropositions.votes", "votes")
    .where("tour.id = :id", { id: currentTour.id })
    .groupBy("votes.clientId")
    .getRawMany();

  const totalVotes = currentTour.votePropositions.reduce(
    (p, c) => p + c.votes.length,
    0
  );
  const adjustedVotes = totalVotes === 0 ? 1 : totalVotes;

  const votes = currentTour.votePropositions.sort((a, b) => {
    const apercentage = 100 * (a.votes.length / adjustedVotes);
    const bpercentage = 100 * (b.votes.length / adjustedVotes);
    return bpercentage - apercentage;
  });

  const embed = new MessageEmbed()
    .setColor(stc(currentPoll.name))
    .setTitle(currentPoll.name)
    .addField("✉ Votes", `${totalVotes} vote(s)`, true)
    .addField("🕺 Votants", `${numberOfVotants.length} votant(s)`, true)
    .addField(
      "📈 Top",
      `\`${votes[0] ? votes[0].proposition.name : "Aucun"}\` est en tête !`,
      true
    )
    .attachFiles([
      new MessageAttachment(await ChartService.generateChart(currentTour)),
    ])
    .setTimestamp();

  await channel.send(embed);
};
