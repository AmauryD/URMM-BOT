import { Client, GuildMember, User } from "discord.js";
import { waitMessage } from "./wait-message";

export async function askQuestion(
  msg: string,
  member: GuildMember | User,
  timeout: number = 60000
) {
  await member.send(msg);
  const response = await waitMessage(member.client, timeout);
  return response.content;
}
