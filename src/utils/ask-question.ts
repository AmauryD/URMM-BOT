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

export async function askConfirmation(
  msg: string | MessageEmbed,
  originalMessage: Message,
  timeout: number = 60000
) {
  const validationEmoji = '✅';
  const denyEmoji = '❌';

  const filter = (reaction: any, user: User) => {
    return ['✅', '❌'].includes(reaction.emoji.name) && user.id === originalMessage.author.id;
  };

  const confirmMessage = await originalMessage.channel.send(msg);

  await confirmMessage.react(validationEmoji)
  await confirmMessage.react(denyEmoji);

  const confirm = await confirmMessage.awaitReactions(filter, { max: 1, time: timeout, errors: ['time'] })
  .then(collected => {
    const reaction = collected.first();
    if(reaction?.emoji.name === validationEmoji) return true;
    return false;
  })
  .catch(collected => originalMessage.reply('Ce n\'est pas une réaction valide :c'));

  return confirm;
}