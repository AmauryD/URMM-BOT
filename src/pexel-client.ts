import { createClient } from "pexels";
import { BotConfig } from "./bot-config";

export class PexelClient {
  private static _client: any | null = null;

  public static get Client() {
    return this._client;
  }

  public static init() {
    return (this._client = createClient(BotConfig.config.foodApiKey));
  }
}
