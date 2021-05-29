import { DiscordClient } from "./discordclient";
import { promises as fs } from "fs";
import {
  GuildMember,
  Message,
  User,
  ClientUser,
  Channel,
  TextChannel,
  DMChannel,
  NewsChannel,
} from "discord.js";
import { MessageArgumentReader, parse } from "discord-command-parser";

export type CommandAction = (
  args: MessageArgumentReader,
  channel: TextChannel | DMChannel,
  user: User,
  originalMessage?: Message
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
  channel?: TextChannel | DMChannel | NewsChannel
) => Promise<boolean> | boolean;

export interface CommandModule {
  commandName: string;
  action: CommandAction;
  description: string;
  listen?: CommandListen;
  access?: AccessFunction;
}

export class CommandHandler {
  private static _instance: CommandHandler;

  public static get() {
    if (!CommandHandler._instance) {
      return (this._instance = new CommandHandler());
    }
    return this._instance;
  }

  protected _commands: CommandsObject = {};

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

  /**
   *
   * @param command The command module
   * @param caller The user which calls the command
   * @param channel The channel used for the command
   * @param args The args
   * @param originalMessage the original message, if command was called from a channel, can be undefined if action is invoked from elsewhere
   * @returns
   */
  async invokeCommand(
    command: CommandModule,
    caller: User,
    channel: TextChannel | DMChannel,
    args: MessageArgumentReader,
    originalMessage?: Message
  ) {
    try {
      const listen =
        typeof command.listen === "function"
          ? (command.listen as CommandListenFunction)()
          : command.listen;

      if (
        typeof command.access === "function" &&
        !(await command.access(caller, channel))
      ) {
        throw new Error("Vous ne pouvez exécuter cette commande");
      }

      console.log(
        `${new Date().toISOString()} : ${caller.username} ${
          command.commandName
        }`
      );

      if (listen === "@dm" && channel.type === "dm") {
        await command.action.call(this, args, channel, caller, originalMessage);
        return true;
      } else if (listen === "@guilds" && channel.type === "text") {
        await command.action.call(this, args, channel, caller, originalMessage);
        return true;
      } else if (listen === channel.id) {
        await command.action.call(this, args, channel, caller, originalMessage);
        return true;
      } else {
        return false;
      }
    } catch (e) {
      const msg = e ? e.message : "Error";
      console.log(e);
      await channel.send(`❌ ${msg}`);
    }
  }

  async handleCommand(message: Message) {
    const parsed = parse(message, "$", {
      allowSpaceBeforeCommand: true,
    });
    if (!parsed.success) return;
    if (this._commands[parsed.command] !== undefined) {
      await this.invokeCommand(
        this._commands[parsed.command],
        message.author,
        message.channel as any,
        parsed.reader,
        message
      );
      if (message.deletable) {
        await message.delete();
      }
    }
  }
}
