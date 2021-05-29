import { BotConfig } from "./bot-config";
import { CommandHandler } from "./commandHandler";
import { DiscordClient } from "./discordclient";
import "reflect-metadata";
import { DatabaseConnection } from "./db-connection";
import { getCustomRepository, getRepository } from "typeorm";
import { GuildMember } from "./models/server";
import { ChartService } from "./utils/chart-service";
import { MessageEmbed, TextChannel } from "discord.js";
import { PexelClient } from "./pexel-client";
import { randomBetween } from "./utils/random-number";
import { randomElement } from "./utils/random-element";
import { CronJobManager } from "./cronjob";
import { PollRepository } from "./repositories/poll.repository";
import { TourRepository } from "./repositories/tour.repository";
import getCurrentPoll from "./utils/get-current-poll";
import { listenToTourReactions } from "./utils/listen-tour-message";
import { TourMessage } from "./models/tour-message";
import { randomFood } from "./utils/random-food";

async function init() {
  const config = await BotConfig.init();
  const [client, ,] = await Promise.all([
    DiscordClient.init(config.token),
    ChartService.init(),
    DatabaseConnection.connect(),
  ]);
  const botUser = client.user!;

  await botUser.setActivity("$help en privé pour les commandes");
  await botUser.setStatus("online");

  const commandHandler = CommandHandler.get();
  await commandHandler.init();

  PexelClient.init();

  CronJobManager.register("food", "0 12,18 * * *", async () => {
    const guildRepo = getRepository(GuildMember);

    const foodServers = await guildRepo
      .createQueryBuilder("gm")
      .where("gm.isActive = 1")
      .andWhere("gm.broadcastFoodChannelId IS NOT NULL")
      .getMany();

    const photos = await randomFood();

    for (const server of foodServers) {
      try {
        const URMMManger = (await client.channels.fetch(
          server.broadcastFoodChannelId!
        )) as TextChannel;
        URMMManger.send("Nom nom nom", { files: [photos[0].src.large] });
      } catch (e) {
        console.log(e);
      }
    }
  });

  client.on("message", (message) => {
    commandHandler.handleCommand(message);
  });

  client.on("guildDelete", async (guild) => {
    const serverRepo = getRepository(GuildMember);
    await serverRepo.update(guild.id, {
      isActive: false,
    });
  });

  client.on("guildCreate", async (guild) => {
    const serverRepo = getRepository(GuildMember);

    let server = await serverRepo.findOne(guild.id);

    if (server) {
      server.isActive = true;
    } else {
      const channel = await guild.channels.create("urmm-bot", { type: "text" });

      server = serverRepo.create({
        guildId: guild.id,
        broadcastChannelId: channel.id,
      });

      const embed = new MessageEmbed()
        .setColor("#0095cb")
        .setTitle("👋 Bonjour 👋")
        .setDescription(
          `Ce channel contiendra les différentes annonces pour les thèmes de la semaine ! 😊`
        )
        .addField(
          "🤖",
          `Pour inviter ce bot sur un Discord utilisez ce lien : https://discord.com/api/oauth2/authorize?client_id=813478558307057734&permissions=201469008&redirect_uri=https%3A%2F%2Fdiscord.com%2Fapi%2Foauth2%2Fauthorize&scope=bot`
        )
        .addField(
          "📝",
          `Faites \`$help\` pour voir les différentes commandes.\nSi vous voulez changer le channel d'annonces faites \`$channel\` dans le channel de votre choix.`
        );

      await channel.send(embed);
    }

    await serverRepo.save(server);
  });

  const currentPoll = await getCurrentPoll();

  if (currentPoll) {
    const lastTour = await getCustomRepository(TourRepository).getLastTour(
      currentPoll.id
    );

    if (lastTour) {
      for (const msg of lastTour.tourMessages) {
        const guild = await client.guilds.fetch(msg.server!.guildId);
        const channel = guild.channels.cache.get(
          msg.server!.broadcastChannelId
        ) as TextChannel;
        try {
          const channelMsg = await channel.messages.fetch(msg.messageId);
          await listenToTourReactions(channelMsg);
        } catch (e) {
          await getRepository(TourMessage).remove(msg);
        }
      }
    }
  }

  console.log("I'm ready to go");
}

init().catch((e) => {
  console.log(e);
  process.exit(2);
});
