import { Connection, createConnection } from "typeorm";
import { BotConfig } from "./bot-config";
import { Poll } from "./models/poll";
import { Proposition } from "./models/proposition";
import { DiscordServer } from "./models/server";
import { Tour } from "./models/tour";
import { TourMessage } from "./models/tour-message";
import { User } from "./models/user";
import { Vote } from "./models/vote";
import { VoteProposition } from "./models/vote-proposition";

export class DatabaseConnection {
  private static _connection: Connection | null = null;

  public static get Connection() {
    return this._connection;
  }

  public static async connect() {
    return (this._connection = await createConnection({
      type: "mysql",
      port: 3306,
      host: BotConfig.config.databaseHost,
      username: BotConfig.config.databaseUser,
      password: BotConfig.config.databasePassword,
      database: BotConfig.config.databaseName,
      logging: process.env.NODE_ENV === "test" ? false : false,
      entities: [
        Poll,
        Proposition,
        Tour,
        VoteProposition,
        Vote,
        DiscordServer,
        User,
        TourMessage,
      ],
      synchronize: true,
    }));
  }
}
