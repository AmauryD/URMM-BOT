import { publishMessageOnEveryServers } from "../utils/publish";
import {
  AccessFunction,
  CommandAction,
  CommandHandler,
} from "../command-handler";
import { MessageEmbed, User as DiscordUser } from "discord.js";
import { isAdmin } from "../utils/is-admin";

export const commandName = "publish";

export const description = "Publie une annonce dans tous les serveurs";

export const access: AccessFunction = (client: DiscordUser) => {
  return isAdmin(client);
};

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  channel,
  caller
) {
  const messageContent = args.body;

  const embed = new MessageEmbed()
    .setColor("#0095cb")
    .setTitle("📋 Annonce")
    .setDescription(messageContent);

  await publishMessageOnEveryServers(embed);
};
