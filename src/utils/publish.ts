import { MessageEmbed, TextChannel } from "discord.js";
import { getRepository } from "typeorm";
import { DiscordClient } from "../discordclient";
import { DiscordServer } from "../models/server";

export const publishMessageOnEveryServers = async (
  messageContent: string | MessageEmbed
) => {
  const announcementArray = [];
  for (const g of DiscordClient.instance.guilds.cache.values()) {
    const repository = getRepository(DiscordServer);

    const server = await repository.findOne(g.id, {
      where: {
        isActive: true,
      },
    });

    if (server) {
      const annoucement = await (
        (await DiscordClient.instance.channels.fetch(
          server.broadcastChannelId
        )) as TextChannel
      ).send(messageContent);
      announcementArray.push(annoucement);
    }
  }
  return announcementArray;
};
