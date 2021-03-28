import { TextChannel } from "discord.js";
import { BotConfig } from "./bot-config";
import { CommandHandler } from "./commandHandler";
import { DiscordClient } from "./discordclient";
import "reflect-metadata";
import { DatabaseConnection } from "./db-connection";
import { getRepository } from "typeorm";
import { GuildMember } from "./models/server";
import { ChartService } from "./utils/chart-service";

async function init() {
  const config = await BotConfig.init();
  const client = await DiscordClient.init(config.token);
  await ChartService.init();
  const botUser = client.user!;

  await botUser.setActivity("Mange des spaghettis");
  if (botUser.username !== "URMM-BOT") {
    await botUser.setUsername("URMM-BOT");
  }
  await botUser.setStatus("dnd");

  await DatabaseConnection.connect();

  const commandHandler = new CommandHandler(client);
  await commandHandler.init();



  client.on("message", (message) => {
    commandHandler.handleCommand(message);
  })

  client.on("guildDelete", async (guild) => {
    const serverRepo = getRepository(GuildMember);
    await serverRepo.update(guild.id,{
      isActive: false
    });
  });

  client.on("guildCreate", async (guild) => {
    const serverRepo = getRepository(GuildMember);

    let server = await serverRepo.findOne(guild.id);

    if (server) {
      server.isActive = true;
    }else{
      const channel = await guild.channels.create("urmm-bot", { type: "text" });

      server = serverRepo.create({
        guildId: guild.id,
        broadcastChannelId : channel.id
      });

      await channel.send(
        "Bonjour ! Ce channel contiendra les différentes annonces pour les thèmes de la semaine ! :D"
      );
    }

    await serverRepo.save(server);

  });

  console.log("I'm ready to go");
}

init();
