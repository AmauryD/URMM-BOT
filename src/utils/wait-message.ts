import { Client, Collection, DMChannel, Message, MessageCollector } from "discord.js";


export async function waitMessage(
  message: Message,
  timeout: number = 60000
): Promise<Message> {
  let filter = (m: Message) => m.author.id === message.author.id;
  let response : Collection<string,Message>;

  try {
    response = await message.channel.awaitMessages(filter, {
        max: 1,
        time: timeout,
        errors: ['time']
    });
  }catch(err) {
    throw new Error("Vous avez mis trop longtemps à répondre");
  }

  const firstMessage = response.first();

  if (firstMessage) {
    return firstMessage;
  }else{
    throw new Error("Erreur lors de votre réponse");
  }
}
