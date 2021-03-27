import { DiscordClient } from "./discordclient";
import { promises as fs } from "fs";
import { Message } from "discord.js";
import { MessageArgumentReader, parse } from "discord-command-parser";
import { BotConfig } from "./bot-config";

export type CommandAction = (
  args: MessageArgumentReader,
  originalMessage: Message
) => Promise<void>;

export interface CommandsObject {
  [key: string]: CommandModule;
}

export interface CommandModule {
  commandName: string;
  action: CommandAction;
  description: string;
}

export class CommandHandler {
  protected _client: DiscordClient;
  protected _commands: CommandsObject = {};

  constructor(client: DiscordClient) {
    this._client = client;
  }

  async init() {
    const commandList = await fs.readdir(`${__dirname}/commands`);

    for (const commandFile of commandList) {
      const commandModule: CommandModule = await import(
        `${__dirname}/commands/${commandFile}`
      );
      this._commands[commandModule.commandName.split(" ")[0]] = commandModule;
    }
  }

  async handleCommand(message: Message) {
    const parsed = parse(message, "$", {
      allowSpaceBeforeCommand: true,
    });
    if (!parsed.success) return;
    if (this._commands[parsed.command] !== undefined) {
      try {
        await this._commands[parsed.command].action.call(
          this,
          parsed.reader,
          message
        );
      } catch (e) {
        const msg = e ? e.message : "Error";
        await message.channel.send(msg);
      }
    }
  }
}
