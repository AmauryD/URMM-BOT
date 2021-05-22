import { MessageArgumentReader } from "discord-command-parser";
import { Message, User } from "discord.js";
import { DiscordClient } from "../discordclient";
import { action as voteAction} from "../commands/vote";
import { action as helpAction} from "../commands/help";
import { action as statusAction} from "../commands/status";

export async function listenToTourReactions(announcement: Message) {
    await Promise.all(
        [announcement.react('🗳'),announcement.react('📊'),announcement.react('❓')]
    );

    const collector = announcement.createReactionCollector( (react,user: User) => user.id !== DiscordClient.instance.user?.id, { max: 1000 })
    collector.on('collect', async (reaction, user) => {
        reaction.users.remove(user);
        if (reaction.emoji.name === "🗳") {
            voteAction(new MessageArgumentReader([],""),user.dmChannel!, user);
        }
        if (reaction.emoji.name === "📊") {
            statusAction(new MessageArgumentReader([],""), user.dmChannel!, user);
        }
        if (reaction.emoji.name === "❓") {
            helpAction(new MessageArgumentReader([],""), user.dmChannel!, user);
        }
    });
}