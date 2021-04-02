import { Connection, createConnection } from "typeorm";
import { Poll } from "./models/poll";
import { Proposition } from "./models/proposition";
import { GuildMember } from "./models/server";
import { Tour } from "./models/tour";
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
      host: "eu-cdbr-west-03.cleardb.net",
      username: "b6fdde6cdcefc8",
      password: "75392a00",
      database: "heroku_79aa261405972d0",
      entities: [Poll, Proposition, Tour, VoteProposition, Vote, GuildMember, User],
      synchronize: true,
    }));
  }
}
