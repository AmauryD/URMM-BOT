import { Message, MessageEmbed, TextChannel, User } from "discord.js";
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

export const access: AccessFunction = (client: User, originalMessage) => {
  return (
    originalMessage?.member?.hasPermission("ADMINISTRATOR") ?? isAdmin(client)
  );
};

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  originalMessage
) {
  const repository = getRepository(GuildMember);

  let guild = await repository.findOne(originalMessage.guild?.id);

  if (!guild) {
    guild = repository.create({
      guildId: originalMessage.guild?.id,
    });
  }

  // text channel, because @guilds
  guild.broadcastChannelId = (originalMessage.channel as TextChannel).id;

  const embed = new MessageEmbed()
    .setColor("#0095cb")
    .setTitle("🥳 Changement de channel 🥳")
    .setDescription(
      `Les annonces du 🤖 pour **${originalMessage.guild?.name}** seront maintenant dans ce channel !`
    );

  await repository.save(guild);
  await originalMessage.channel.send(embed);
  await originalMessage.delete();
};
