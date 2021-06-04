import { BotConfig } from "./bot-config";
import { CommandHandler } from "./commandHandler";
import { DiscordClient } from "./discordclient";
import "reflect-metadata";
import { DatabaseConnection } from "./db-connection";
import { getCustomRepository, getRepository } from "typeorm";
import { DiscordServer, DiscordServerType } from "./models/server";
import { ChartService } from "./utils/chart-service";
import { MessageEmbed, TextChannel } from "discord.js";
import { PexelClient } from "./pexel-client";
import { CronJobManager } from "./cronjob";
import { TourRepository } from "./repositories/tour.repository";
import getCurrentPoll from "./utils/get-current-poll";
import { listenToTourReactions } from "./utils/listen-tour-message";
import { TourMessage } from "./models/tour-message";
import { randomImage } from "./utils/random-image";
import { DiscordServerRepository } from "./repositories/server.repository";
import { breakfast, dinner, gouter, midday } from "./static/food-keywords";

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

  const guildRepo = getCustomRepository(DiscordServerRepository);
  const foodServers = await guildRepo
    .activeServersBuilder()
    .andWhere("server.broadcastFoodChannelId IS NOT NULL")
    .getMany();

  CronJobManager.register("food", "0 9 * * *", async () => {
    const photos = await randomImage(breakfast, 50);

    if (!photos.length) return;

    for (const server of foodServers) {
      try {
        const URMMManger = (await client.channels.fetch(
          server.broadcastFoodChannelId!
        )) as TextChannel;
        await URMMManger.send(
          "Le petit déjeuner est le repas le plus important de la journée 😋",
          {
            files: [photos[0].src.large],
          }
        );
      } catch (e) {
        console.log(e);
      }
    }
  });

  CronJobManager.register("food", "0 12 * * *", async () => {
    const photos = await randomImage(midday, 50);

    if (!photos.length) return;

    for (const server of foodServers) {
      try {
        const URMMManger = (await client.channels.fetch(
          server.broadcastFoodChannelId!
        )) as TextChannel;
        await URMMManger.send("C'est l'heure de manger 😋", {
          files: [photos[0].src.large],
        });
      } catch (e) {
        console.log(e);
      }
    }
  });

  CronJobManager.register("food", "0 16 * * *", async () => {
    const photos = await randomImage(gouter, 50);

    if (!photos.length) return;

    for (const server of foodServers) {
      try {
        const URMMManger = (await client.channels.fetch(
          server.broadcastFoodChannelId!
        )) as TextChannel;
        await URMMManger.send("C'est l'heure du goûter 😋", {
          files: [photos[0].src.large],
        });
      } catch (e) {
        console.log(e);
      }
    }
  });

  CronJobManager.register("food", "0 18 * * *", async () => {
    const photos = await randomImage(dinner, 50);

    if (!photos.length) return;

    for (const server of foodServers) {
      try {
        const URMMManger = (await client.channels.fetch(
          server.broadcastFoodChannelId!
        )) as TextChannel;
        await URMMManger.send(
          "C'est l'heure de profiter d'un bon repas après une dure journée 😋",
          { files: [photos[0].src.large] }
        );
      } catch (e) {
        console.log(e);
      }
    }
  });

  client.on("message", (message) => {
    commandHandler.handleCommand(message);
  });

  client.on("guildDelete", async (guild) => {
    const serverRepo = getRepository(DiscordServer);
    await serverRepo.update(guild.id, {
      isActive: false,
    });
  });

  client.on("guildCreate", async (guild) => {
    const serverRepo = getRepository(DiscordServer);

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

  console.log(
    `Bot prêt et lancé en mode ${process.env.NODE_ENV ?? "production"}`
  );
}

init().catch((e) => {
  console.log(e);
  process.exit(2);
});
