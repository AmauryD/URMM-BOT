import { MessageEmbed } from "discord.js";
import stc from "string-to-color";
import { getRepository } from "typeorm";
import { CommandAction, CommandHandler } from "../commandHandler";
import { Poll } from "../models/poll";

export const commandName = "theme";

export const description = "C'est quoi le thème de la semaine ?";

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  channel
) {
  const pollRepository = getRepository(Poll);
  const lastPoll = await pollRepository.createQueryBuilder("poll")
    .select()
    .innerJoinAndSelect("poll.winner","winner")
    .orderBy("poll.createdAt","DESC")
    .where("poll.status != 'active'")
    .getOne();

  if (!lastPoll) {
    throw new Error("Il n'y a pas de thème de la semaine.");
  }

  const embed = new MessageEmbed()
    .setColor(stc(lastPoll.name))
    .setTitle(lastPoll.name)
    .setDescription(`Le thème de la semaine est : **${lastPoll.winner!.name}** 😎`);

  await channel.send(embed);
};
