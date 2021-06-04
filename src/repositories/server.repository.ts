import { EntityRepository, Repository } from "typeorm";
import { DiscordServer, DiscordServerType } from "../models/server";

@EntityRepository(DiscordServer)
export class DiscordServerRepository extends Repository<DiscordServer> {
  public activeServersBuilder() {
    return this.createQueryBuilder("server")
      .where("FIND_IN_SET(:type,server.type) > 0", {
        type:
          process.env.NODE_ENV === "test"
            ? DiscordServerType.DEV
            : DiscordServerType.PROD,
      })
      .andWhere("server.isActive = 1");
  }
}
