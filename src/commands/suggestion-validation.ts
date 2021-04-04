import { User as DiscordUser } from "discord.js";
import { DatabaseConnection } from "../db-connection";
import { Proposition } from "../models/proposition";
import { AccessFunction, CommandAction, CommandHandler } from "../commandHandler";
import { askQuestion } from "../utils/ask-question";
import { isAdmin } from "../utils/is-admin";

export const commandName = "suggestion-validation";

export const description = "Valider les suggestions proposés :)";

export const access : AccessFunction = (client: DiscordUser) => {
    return isAdmin(client);
}

export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  originalMessage
) {
  const propositionRepo = DatabaseConnection.Connection?.getRepository(
    Proposition
  )!;

  const propositions = await propositionRepo
    .createQueryBuilder("proposition")
    .select()
    .where("proposition.state IS 'waiting'")
    .getMany();

  await originalMessage.reply(`Il y a ${propositions.length} propositions en attente.`);

    for (let prop of propositions) {

      const isValidated = await askQuestion(
        `est-ce que ${prop.name} est une suggestion valide ?(y/n)`,
        originalMessage
      );

      if (isValidated === "y") {
        prop.state = "validated";
      } else {
        const denyingReason = await askQuestion(
          `Pourquoi ${prop.name} est une suggestion invalide ?`,
          originalMessage
        );
        prop.note = `Raison du refus : ${denyingReason}`;
      }

    }

  await propositionRepo.save(propositions);
  await originalMessage.reply("Félicitations 🎉, Vous avez terminé de valider les suggestions en attentes :)");
};
