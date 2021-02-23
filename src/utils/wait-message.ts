import { Client, Message } from "discord.js";

export function waitMessage(
  client: Client,
  timeout: number = 60000
): Promise<Message> {
  return new Promise((res, rej) => {
    const handler = setTimeout(rej, timeout);
    client.on("message", (msg: Message) => {
      if (msg.channel.type !== "dm") return;
      clearTimeout(handler);
      res(msg);
    });
  });
}
