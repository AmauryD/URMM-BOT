import { GuildMember, Message, MessageEmbed, User } from "discord.js";
import { waitMessage } from "./wait-message";

export async function askQuestion(
  msg: string | MessageEmbed,
  originalMessage: Message,
  timeout: number = 60000
) {
  const response = await askQuestionRaw(msg,originalMessage,timeout);
  return response.content;
}

export async function askQuestionRaw(
  msg: string | MessageEmbed,
  originalMessage: Message,
  timeout: number = 60000
) {
  await originalMessage.channel.send(msg);
  const response = await waitMessage(originalMessage, timeout);
  return response;
}
