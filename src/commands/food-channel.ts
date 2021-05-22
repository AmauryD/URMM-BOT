import { Message, MessageEmbed, NewsChannel, TextChannel, User } from "discord.js";
import { getRepository } from "typeorm";
import {
  AccessFunction,
  CommandAction,
  CommandHandler,
  CommandListen,
} from "../commandHandler";
import { GuildMember } from "../models/server";
import { isAdmin } from "../utils/is-admin";

export const commandName = "food-channel";

export const description = "Change location of food channel for current guild";

export const listen: CommandListen = "@guilds";

export const access: AccessFunction = (client: User, channel) => {
  return (
    (channel as TextChannel)?.guild.member(client)?.hasPermission("ADMINISTRATOR") ?? isAdmin(client)
  ) ?? false;
};

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  channel: any,
  caller
) {
  const repository = getRepository(GuildMember);

  let guild = await repository.findOne(channel.guild?.id);

  if (!guild) {
    guild = repository.create({
      guildId: channel.guild?.id,
    });
  }

  // text channel, because @guilds
  guild.broadcastFoodChannelId = (channel as TextChannel).id;

  const embed = new MessageEmbed()
    .setColor("#0095cb")
    .setTitle("🥳 Changement de channel 🥳")
    .setDescription(
      `Les annonces de 🍔 nourriture 🍔 pour **${channel.guild?.name}** seront maintenant dans ce channel !`
    );

  await repository.save(guild);
  await channel.send(embed);
};
