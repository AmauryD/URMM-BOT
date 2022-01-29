import { MessageAttachment, MessageEmbed, TextChannel } from "discord.js";
import { getCustomRepository } from "typeorm";
import { DiscordClient } from "../discord-client";
import { DiscordServerRepository } from "../repositories/server-repository";

export const publishMessageOnEveryServers = async (
  messageContent: string | MessageEmbed,
  files?: MessageAttachment[]
) => {
  const announcementArray = [];
  const repository = getCustomRepository(DiscordServerRepository);
  const servers = await repository.activeServersBuilder().getMany();

  for (const server of servers) {
    const channel = (await DiscordClient.instance.channels.fetch(
      server.broadcastChannelId
    )) as TextChannel;

    const annoucement = await channel.send(messageContent instanceof MessageEmbed ? { embeds: [messageContent] , files } : { content : messageContent, files });

    announcementArray.push({ message: annoucement, server });
  }

  return announcementArray;
};
