import { User as DiscordUser, User } from "discord.js";
import { DatabaseConnection } from "../db-connection";
import { Proposition, PropositionState } from "../models/proposition";
import {
  AccessFunction,
  CommandAction,
  CommandHandler,
} from "../command-handler";
import { askConfirmation, askQuestion } from "../utils/ask-question";
import { isAdmin } from "../utils/is-admin";

export const commandName = "suggestion-validation";

export const description = "Valider les suggestions proposés :)";

export const access: AccessFunction = (client: DiscordUser) => {
  return isAdmin(client);
};

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  channel,
  caller
) {
  const propositionRepo =
    DatabaseConnection.Connection?.getRepository(Proposition)!;

  const propositions = await propositionRepo
    .createQueryBuilder("proposition")
    .select()
    .where(`proposition.state = '${PropositionState.WAITING}'`)
    .getMany();

  await channel.send(`Il y a ${propositions.length} propositions en attente.`);

  for (const prop of propositions) {
    const isConfirmed = await askConfirmation(
      `Est-ce que ${prop.name} est une suggestion valide ?`,
      channel,
      caller
    );
    if (isConfirmed) {
      prop.state = PropositionState.VALIDATED;
    } else {
      const denyingReason = await askQuestion(
        `Pourquoi ${prop.name} est une suggestion invalide ?`,
        channel,
        caller
      );
      prop.state = PropositionState.DENIED;
      prop.note = `${denyingReason}`;
    }
  }

  await propositionRepo.save(propositions);
  await channel.send(
    "Félicitations 🎉, Vous avez terminé de valider les suggestions en attentes :)"
  );
};
