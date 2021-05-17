import { Message, MessageEmbed, TextChannel } from "discord.js";
import { getRepository } from "typeorm";
import { DiscordClient } from "../discordclient";
import { GuildMember } from "../models/server";

export const publishMessageOnEveryServers = async (messageContent : string | MessageEmbed) => {
    const announcementArray = [];
    for (const g of DiscordClient.instance.guilds.cache.values()) {
      const repository = getRepository(GuildMember);

      const server = await repository.findOne(g.id,{
        where: {
          isActive : true
        }
      });

      if (server) {
        const annoucement = ((await DiscordClient.instance.channels.fetch(server.broadcastChannelId)) as TextChannel).send(messageContent);
        announcementArray.push(annoucement);
      }
    }
    return announcementArray;
}