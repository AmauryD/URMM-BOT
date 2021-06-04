import { MessageEmbed, TextChannel } from "discord.js";
import { getCustomRepository, getRepository } from "typeorm";
import { DiscordClient } from "../discordclient";
import { DiscordServer, DiscordServerType } from "../models/server";
import { DiscordServerRepository } from "../repositories/server.repository";

export const publishMessageOnEveryServers = async (
  messageContent: string | MessageEmbed
) => {
  const announcementArray = [];
  const repository = getCustomRepository(DiscordServerRepository);
  const servers = await repository.activeServersBuilder().getMany();

  for (const server of servers) {
    const channel = (await DiscordClient.instance.channels.fetch(
      server.broadcastChannelId
    )) as TextChannel;

    const annoucement = await channel.send(messageContent);

    announcementArray.push({ message: annoucement, server });
  }

  return announcementArray;
};
