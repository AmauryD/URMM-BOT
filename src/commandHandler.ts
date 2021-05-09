import { DiscordClient } from "./discordclient";
import { promises as fs } from "fs";
import { GuildMember, Message, User } from "discord.js";
import { MessageArgumentReader, parse } from "discord-command-parser";

export type CommandAction = (
  args: MessageArgumentReader,
  originalMessage: Message
) => Promise<void>;

export interface CommandsObject {
  [key: string]: CommandModule;
}

type CommandListenFunction = () => `${number}`;

export type CommandListen =
  | "@guilds"
  | `${number}`
  | "@dm"
  | CommandListenFunction;

export type AccessFunction = (
  client: User,
  originalMessage?: Message
) => Promise<boolean> | boolean;

export interface CommandModule {
  commandName: string;
  action: CommandAction;
  description: string;
  listen: CommandListen;
  access: AccessFunction;
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
      commandModule.listen ??= "@dm";
    }
  }

  async handleCommand(message: Message) {
    const parsed = parse(message, "$", {
      allowSpaceBeforeCommand: true,
    });
    if (!parsed.success) return;
    if (this._commands[parsed.command] !== undefined) {
      try {
        const listen =
          typeof this._commands[parsed.command].listen === "function"
            ? (this._commands[parsed.command].listen as CommandListenFunction)()
            : this._commands[parsed.command].listen;

        if (
          typeof this._commands[parsed.command].access === "function" &&
          !(await this._commands[parsed.command].access(message.author))
        ) {
          throw new Error("Vous ne pouvez exécuter cette commande");
        }

        console.log(
          `${new Date().toISOString()} : ${message.author.username} ${
            parsed.command
          }`
        );

        if (listen === "@dm" && message.channel.type === "dm") {
          await this._commands[parsed.command].action.call(
            this,
            parsed.reader,
            message
          );
        } else if (listen === "@guilds" && message.channel.type === "text") {
          await this._commands[parsed.command].action.call(
            this,
            parsed.reader,
            message
          );
        } else if (listen === message.channel.id) {
          await this._commands[parsed.command].action.call(
            this,
            parsed.reader,
            message
          );
        }
      } catch (e) {
        const msg = e ? e.message : "Error";
        await message.channel.send(`❌ ${msg}`);
      }
    }
  }
}
