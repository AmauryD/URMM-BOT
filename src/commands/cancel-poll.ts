import { User as DiscordUser } from "discord.js";
import { getCustomRepository } from "typeorm";
import { AccessFunction, CommandAction, CommandHandler } from "../commandHandler";
import { PollStatus } from "../models/poll";
import { PollRepository } from "../repositories/poll.repository";
import { TourRepository } from "../repositories/tour.repository";
import getCurrentPoll from "../utils/get-current-poll";
import stc from "string-to-color";
import { isAdmin } from "../utils/is-admin";
import { askQuestion } from "../utils/ask-question";

export const commandName = "cancel-poll";

export const description = "Annule le concours de la semaine";

export const access : AccessFunction = (client: DiscordUser) => {
  return isAdmin(client);
}

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  channel,
  caller
) {
  const repo = getCustomRepository(TourRepository);
  const pollRepo = getCustomRepository(PollRepository);
  const currentPoll = await getCurrentPoll();

  if (!currentPoll) {
    throw new Error("Aucun sondage n'est en cours ! :(");
  }

  const response = await askQuestion(
    `Êtes-vous sûr ? (y/n)`,
    channel,
    caller,
    30000
  );

  if (response.content === "y") {
    // aborded
    currentPoll.status = PollStatus.Closed;
    await pollRepo.save(currentPoll);
    await channel.send("Le dernier sondage a été annulé !");
  }
};
