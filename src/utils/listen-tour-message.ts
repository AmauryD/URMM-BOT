import { MessageArgumentReader } from "discord-command-parser";
import { Message, User } from "discord.js";
import { DiscordClient } from "../discord-client";
import * as voteModule from "../commands/vote";
import * as helpModule from "../commands/help";
import * as statusModule from "../commands/status";
import { CommandHandler } from "../command-handler";

export async function listenToTourReactions(announcement: Message) {
  await Promise.all([
    announcement.react("🗳"),
    announcement.react("📊"),
    announcement.react("❓"),
  ]);

  const collector = announcement.createReactionCollector(
    (react, user: User) => user.id !== DiscordClient.instance.user?.id,
    { max: 1000 }
  );
  collector.on("collect", async (reaction, user) => {
    reaction.users.remove(user);

    let channel = user.dmChannel;
    if (!channel) {
      channel = await user.createDM();
    }

    if (reaction.emoji.name === "🗳") {
      CommandHandler.get().invokeCommand(
        voteModule,
        user,
        channel,
        new MessageArgumentReader([], "")
      );
    }
    if (reaction.emoji.name === "📊") {
      CommandHandler.get().invokeCommand(
        statusModule,
        user,
        channel,
        new MessageArgumentReader([], "")
      );
    }
    if (reaction.emoji.name === "❓") {
      CommandHandler.get().invokeCommand(
        helpModule,
        user,
        channel,
        new MessageArgumentReader([], "")
      );
    }
  });
}
