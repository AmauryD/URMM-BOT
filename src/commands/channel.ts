import { DMChannel, MessageEmbed, TextChannel, User } from "discord.js";
import { getRepository } from "typeorm";
import {
  AccessFunction,
  CommandAction,
  CommandHandler,
  CommandListen,
} from "../commandHandler";
import { GuildMember } from "../models/server";
import { isAdmin } from "../utils/is-admin";

export const commandName = "channel";

export const description =
  "Change location of announcement channel for current guild";

export const listen: CommandListen = "@guilds";

export const access: AccessFunction = (client: User, channel) => {
  if (channel instanceof DMChannel) {
    return false;
  }
  return (
    channel?.guild.member(client)?.hasPermission("ADMINISTRATOR") ?? isAdmin(client)
  ) ?? false;
};

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  channel,
  caller
) {
  const repository = getRepository(GuildMember);
  const textChannel = channel as TextChannel;

  let guild = await repository.findOne(textChannel.guild.id);

  if (!guild) {
    guild = repository.create({
      guildId: textChannel.guild.id,
    });
  }

  // text channel, because @guilds
  guild.broadcastChannelId = textChannel.id;

  const embed = new MessageEmbed()
    .setColor("#0095cb")
    .setTitle("🥳 Changement de channel 🥳")
    .setDescription(
      `Les annonces du 🤖 pour **${textChannel.guild.name}** seront maintenant dans ce channel !`
    );

  await repository.save(guild);
  await textChannel.send(embed);
};
