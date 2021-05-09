import { BotConfig } from "./bot-config";
import { CommandHandler } from "./commandHandler";
import { DiscordClient } from "./discordclient";
import "reflect-metadata";
import { DatabaseConnection } from "./db-connection";
import { getRepository } from "typeorm";
import { GuildMember } from "./models/server";
import { ChartService } from "./utils/chart-service";
import { MessageEmbed, TextChannel } from "discord.js";
import { PexelClient } from "./pexel-client";
import { randomBetween } from "./utils/random-number";
import { randomElement } from "./utils/random-element";
import { CronJobManager } from "./cronjob";

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

  const commandHandler = new CommandHandler(client);
  await commandHandler.init();

  const pexelClient = PexelClient.init();

  CronJobManager.register("food", "0 12,18 * * *", async () => {
    const guildRepo = getRepository(GuildMember);

    const foods = [
      "pizza",
      "burger",
      "food",
      "pasta",
      "steak",
      "sushi",
      "ramen",
      "sandwich",
    ];

    const foodServers = await guildRepo
      .createQueryBuilder("gm")
      .where("gm.isActive = 1")
      .andWhere("gm.broadcastFoodChannelId IS NOT NULL")
      .getMany();

    const query = {
      query: randomElement(foods),
      per_page: 1,
    };

    const images: Record<string, any> = await pexelClient.photos.search(query);

    const total = images.total_results;
    const page = randomBetween(1, Math.min(total, 100));

    const { photos }: Record<string, any> = await pexelClient.photos.search({
      ...query,
      page,
    });

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

  console.log("I'm ready to go");
}

init().catch((e) => {
  console.log(e);
  process.exit(2);
});
