import { Channel, DMChannel, GuildMember, Message, MessageEmbed, NewsChannel, TextChannel, User } from "discord.js";
import { waitMessage } from "./wait-message";

/**
 * 
 * @param msg The message to send
 * @param channel The channel to send the message
 * @param from The person who's allowed to answer
 * @param timeout
 * @returns 
 */
export async function askQuestion(
  msg: string | MessageEmbed,
  channel: TextChannel | DMChannel | NewsChannel,
  from: User,
  timeout: number = 60000
) {
  await channel.send(msg);
  const response = await waitMessage(channel,from, timeout);
  return response;
}

/**
 * 
 * @param msg The message to send
 * @param channel The channel to send the message
 * @param from The person who's allowed to react
 * @param timeout
 * @returns 
 */
export async function askConfirmation(
  msg: string | MessageEmbed,
  channel: TextChannel | DMChannel | NewsChannel,
  from: User,
  timeout: number = 60000
) {
  const validationEmoji = '✅';
  const denyEmoji = '❌';

  const filter = (reaction: any, user: User) => {
    return ['✅', '❌'].includes(reaction.emoji.name) && user.id === from.id;
  };

  const confirmMessage = await channel.send(msg);

  await confirmMessage.react(validationEmoji)
  await confirmMessage.react(denyEmoji);

  const confirm = await confirmMessage.awaitReactions(filter, { max: 1, time: timeout, errors: ['time'] })
  .then(collected => {
    const reaction = collected.first();
    if(reaction?.emoji.name === validationEmoji) return true;
    return false;
  })
  .catch(collected => channel.send('Ce n\'est pas une réaction valide :c'));

  return confirm;
}