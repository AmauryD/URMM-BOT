import { TextChannel } from "discord.js";
import { BotConfig } from "./bot-config";
import { CommandHandler } from "./commandHandler";
import { DiscordClient } from "./discordclient";
import "reflect-metadata";

async function init() {
  const config = await BotConfig.init();
  const client = await DiscordClient.init(config.token);
  const botUser = client.user!;

  await botUser.setActivity("Mange des spaghettis");
  if (botUser.username !== "URMM-BOT") {
    await botUser.setUsername("URMM-BOT");
  }
  await botUser.setStatus("dnd");

  const commandHandler = new CommandHandler(client);
  await commandHandler.init();

  const listenChannel = (await client.channels.fetch(
    BotConfig.getKey("publishChannel")
  )) as TextChannel;

  client.on("message", (message) => {
    if (message.channel.id === listenChannel.id) {
      commandHandler.handleCommand.bind(commandHandler)(message);
    }
  });

  client.on("guildCreate", async (guild) => {
    if (
      !guild.channels.cache.find(
        (c) => c.name === "urmm-bot" && c.type === "text"
      )
    ) {
      const channel = await guild.channels.create("urmm-bot", { type: "text" });
      channel.send(
        "Bonjour ! Ce channel contiendra les différentes annonces pour les thèmes de la semaine ! :D"
      );
    }
  });

  console.log("I'm ready to go");
}

init();
