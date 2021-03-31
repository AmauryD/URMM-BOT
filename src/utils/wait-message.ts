import { Client, Message } from "discord.js";


export function waitMessage(
  client: Client,
  timeout: number = 60000
): Promise<Message> {
  return new Promise((res, rej) => {
    const listenForMessage =  (msg: Message) => {
      if (msg.channel.type !== "dm") return;
      clearTimeout(handler);
      res(msg);
    }

    const handler = setTimeout(() => {
      client.removeListener("message",listenForMessage);
      rej("Vous avez attendu trop longtemps pour répondre.");
    }, timeout);
    
    client.once("message",listenForMessage);
  });
}
