import { BotConfig } from "./bot-config";
import { CommandHandler } from "./commandHandler";
import { DiscordClient } from "./discordclient";
import "reflect-metadata";
import { DatabaseConnection } from "./db-connection";
import { getRepository } from "typeorm";
import { GuildMember } from "./models/server";
import { ChartService } from "./utils/chart-service";
import { MessageEmbed } from "discord.js";

async function init() {
  const config = await BotConfig.init();
  const [client,,] = await Promise.all([
    DiscordClient.init(config.token),
    ChartService.init(),
    DatabaseConnection.connect()
  ]);
  const botUser = client.user!;

  botUser.setActivity("Mange des spaghettis");
  if (botUser.username !== "URMM-BOT") {
    botUser.setUsername("URMM-BOT");
  }
  botUser.setStatus("dnd");

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

      const embed = new MessageEmbed()
        .setColor("#0095cb")
        .setTitle("👋 Bonjour 👋")
        .setDescription(`Ce channel contiendra les différentes annonces pour les thèmes de la semaine ! 😊`)
        .addField("🤖",`Pour inviter ce bot sur un Discord utilisez ce lien : https://discord.com/api/oauth2/authorize?client_id=813478558307057734&permissions=201469008&redirect_uri=https%3A%2F%2Fdiscord.com%2Fapi%2Foauth2%2Fauthorize&scope=bot`)
        .addField("📝",`Faites \`$help\` pour voir les différentes commandes.\nSi vous voulez changer le channel d'annonces faites \`$channel\` dans le channel de votre choix.`);

      await channel.send(embed);
    }

    await serverRepo.save(server);

  });

  console.log("I'm ready to go");
}

init()
  .catch((e) => {
    process.exit(2);
  })
