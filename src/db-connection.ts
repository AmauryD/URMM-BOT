import { Connection, createConnection } from "typeorm";
import { BotConfig } from "./bot-config";
import { Poll } from "./models/poll";
import { Proposition } from "./models/proposition";
import { GuildMember } from "./models/server";
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
      entities: [
        Poll,
        Proposition,
        Tour,
        VoteProposition,
        Vote,
        GuildMember,
        User,
        TourMessage,
      ],
      synchronize: true,
    }));
  }
}
