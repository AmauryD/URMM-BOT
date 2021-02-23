import dotenv from "dotenv";

export interface BotConfigObject {
  token: string;
  reunionTime: [number, number, number];
  reunionTagRolesIds: string[];
  reunionTagChannelId: string;
  botUsername: string;
  commandPrefix: string;
  commandChannel: string;
  statesChannel: string;
}

export class BotConfig {
  private static _config: BotConfigObject;

  public static get config() {
    if (BotConfig._config === undefined) {
      throw new Error("Config is not loaded yet");
    }
    return BotConfig._config;
  }

  public static getKey(key: keyof BotConfigObject): any {
    return BotConfig._config[key];
  }

  public static async init(): Promise<BotConfigObject> {
    let { parsed, error } = dotenv.config({ path: "config.env" });
    let config: BotConfigObject = {} as any;

    if (parsed === undefined) {
      parsed = process.env as any;
    }

    config.token = parsed!.TOKEN;
    config.reunionTime = parsed!.REUNION_TIME.split(",").map((el) =>
      parseInt(el)
    ) as [number, number, number];
    config.reunionTagRolesIds = parsed!.REUNION_TAGS.split(",");
    config.reunionTagChannelId = parsed!.REUNION_CHANNEL_ID;
    config.botUsername = parsed!.USERNAME;
    config.commandPrefix = parsed!.COMMAND_PREFIX;
    config.commandChannel = parsed!.COMMAND_CHANNEL;
    config.statesChannel = parsed!.STATES_CHANNEL;

    return (BotConfig._config = config);
  }
}
