
import { TextChannel } from "discord.js";
import { getRepository } from "typeorm";
import { CommandAction, CommandHandler, CommandListen } from "../commandHandler";
import { GuildMember } from "../models/server";

export const commandName = "channel";

export const description = "Change location of announcement channel for current guild";

export const listen: CommandListen = "@guilds";

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  originalMessage
) {
  if (originalMessage.member?.hasPermission("ADMINISTRATOR") || originalMessage.member?.roles.cache.find((v) => {
    return v.name.toUpperCase() === "BOT-MANAGER";
  })) {
    const repository = getRepository(GuildMember);

    let guild = await repository.findOne(originalMessage.guild?.id);

    if (!guild) {
      guild = repository.create({
        guildId: originalMessage.guild?.id
      }); 
    }

    // text channel, because @guilds
    guild.broadcastChannelId = (originalMessage.channel as TextChannel).id;

    await repository.save(guild);
    await originalMessage.channel.send(`🥳🥳🥳 Les annonces du BOT pour ${originalMessage.guild?.name} seront maintenant dans ce channel ! 🥳🥳🥳`);
    await originalMessage.delete();
  }else{
    await originalMessage.reply("Vous n'avez pas les droits suffisants");
  }
};
