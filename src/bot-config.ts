import dotenv from "dotenv";

export interface BotConfigObject {
  token: string;
  publishChannel: string;
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
    config.publishChannel = parsed!.PUBLISH_CHANNEL_ID;

    return (BotConfig._config = config);
  }
}
