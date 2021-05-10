import { User as DiscordUser } from "discord.js";
import { DatabaseConnection } from "../db-connection";
import { Proposition, PropositionState } from "../models/proposition";
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
    .where(`proposition.state = '${PropositionState.WAITING}'`)
    .getMany();

  await originalMessage.reply(`Il y a ${propositions.length} propositions en attente.`);
  const validationEmoji = '✅';
  const denyEmoji = '❌';

    for (let prop of propositions) {

      const isValidated = await askQuestion(
        `est-ce que ${prop.name} est une suggestion valide ?(y/n)`,
        originalMessage
      );

      originalMessage.react(validationEmoji)
      .then(() => originalMessage.react(denyEmoji));

      const filter = (reaction) => {
        return ['✅', '❌'].includes(reaction.emoji.name);
      };

      originalMessage.awaitReactions(filter, { max: 1, time: 5000, errors: ['time'] })
      .then(async collected => {
        const reaction = collected.first();

        if (reaction!.emoji.name === '✅') {
          prop.state = PropositionState.VALIDATED;
        } else {
          const denyingReason = await askQuestion(
            `Pourquoi ${prop.name} est une suggestion invalide ?`,
            originalMessage
          );
          prop.state = PropositionState.DENIED;
          prop.note = `${denyingReason}`;
        }
      })
      .catch(collected => {
        originalMessage.reply('Ce n\'est pas une réaction valide :c');
      });
    }

  await propositionRepo.save(propositions);
  await originalMessage.reply("Félicitations 🎉, Vous avez terminé de valider les suggestions en attentes :)");
};
