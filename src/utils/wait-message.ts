import { Client, Collection, DMChannel, Message, MessageCollector, NewsChannel, TextChannel, User } from "discord.js";


export async function waitMessage(
  channel: TextChannel | DMChannel | NewsChannel,
  waitFrom: User,
  timeout = 60000
): Promise<Message> {
  const filter = (m: Message) => m.author.id === waitFrom.id;
  let response : Collection<string,Message>;

  try {
    response = await channel.awaitMessages(filter, {
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
