import dotenv, { parse } from "dotenv";

export interface BotConfigObject {
  token: string;
  foodApiKey: string;
  databaseHost: string;
  databaseUser: string;
  databaseName: string;
  databasePassword: string;
  chromeBin: string;
  commandPrefix: string;
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
    const config: BotConfigObject = {} as any;

    if (parsed === undefined) {
      parsed = process.env as any;
    }

    config.token = parsed!.TOKEN;
    config.foodApiKey = parsed!.FOOD_API_KEY;
    config.databaseHost = parsed!.DATABASE_HOST;
    config.databaseName = parsed!.DATABASE_NAME;
    config.databaseUser = parsed!.DATABASE_USER;
    config.databasePassword = parsed!.DATABASE_PASSWORD;
    config.chromeBin = parsed!.CHROME_BIN;
    config.commandPrefix =
      process.env.NODE_ENV === "test" ? "*" : parsed!.COMMAND_PREFIX;

    return (BotConfig._config = config);
  }
}
