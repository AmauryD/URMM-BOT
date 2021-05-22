import { MessageArgumentReader } from "discord-command-parser";
import { Message, User } from "discord.js";
import { DiscordClient } from "../discordclient";
import * as voteModule from "../commands/vote";
import * as helpModule from "../commands/help";
import * as statusModule from "../commands/status";
import { CommandHandler } from "../commandHandler";

export async function listenToTourReactions(announcement: Message) {
    await Promise.all(
        [announcement.react('🗳'),announcement.react('📊'),announcement.react('❓')]
    );

    const collector = announcement.createReactionCollector( (react,user: User) => user.id !== DiscordClient.instance.user?.id, { max: 1000 })
    collector.on('collect', async (reaction, user) => {
        reaction.users.remove(user);
        if (reaction.emoji.name === "🗳") {
            CommandHandler.get().invokeCommand(voteModule,user,user.dmChannel!,new MessageArgumentReader([],""));
        }
        if (reaction.emoji.name === "📊") {
            CommandHandler.get().invokeCommand(statusModule,user,user.dmChannel!,new MessageArgumentReader([],""));
        }
        if (reaction.emoji.name === "❓") {
            CommandHandler.get().invokeCommand(helpModule,user,user.dmChannel!,new MessageArgumentReader([],""));
        }
    });
}