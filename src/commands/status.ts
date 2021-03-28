import { getCustomRepository, getRepository } from "typeorm";
import { CommandAction, CommandHandler } from "../commandHandler";
import { Poll } from "../models/poll";
import { Proposition } from "../models/proposition";
import { VoteProposition } from "../models/vote-proposition";
import { TourRepository } from "../repositories/tour.repository";
import { askQuestion } from "../utils/ask-question";
import getCurrentPoll from "../utils/get-current-poll";
import {MessageEmbed, TextChannel } from "discord.js";
const exporter = require('highcharts-export-server');

export const commandName = "status";

export const description = "Commence un nouveau tour !";

const percentageToProgressBar = (progress: number) => {
    const maxbars = 3;
    let bar = "\[";
    for (let index = 0; index <= 100; index += 100 / maxbars) {
        bar+= progress >= index ? "\-" : "\ ";
    }
    return bar + "\]";
};

const getchart = () => {
    return new Promise((res,rej) => {
        let exportSettings = {
            type: 'png',
            options: {
                title: {
                    text: 'My Chart'
                },
                xAxis: {
                    categories: ["Jan", "Feb", "Mar", "Apr", "Mar", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                },
                series: [
                    {
                        type: 'line',
                        data: [1, 3, 2, 4]
                    },
                    {
                        type: 'line',
                        data: [5, 3, 4, 2]
                    }
                ]
            }
        };

        //Set up a pool of PhantomJS workers
        exporter.initPool();

        //Perform an export
        /*
            Export settings corresponds to the available CLI arguments described
            above.
        */
        exporter.export(exportSettings, (err: Error, resp: any) => {
            res(resp);
            exporter.killPool();
        });
    });
}


export const action: CommandAction = async function (
  this: CommandHandler,
  args,
  originalMessage
) {
  const repo = getCustomRepository(TourRepository);

  let currentPoll = await getCurrentPoll();

  if (!currentPoll) {
    throw new Error("Aucun sondage n'est en cours !");
  }

  const currentTour = await repo
    .createQueryBuilder("tour")
    .innerJoinAndSelect("tour.poll", "poll")
    .leftJoinAndSelect("tour.votePropositions", "votePropositions")
    .leftJoinAndSelect("votePropositions.votes", "votes")
    .innerJoinAndSelect("votePropositions.proposition", "proposition")
    .where("tour.pollId = :pollId", { pollId: currentPoll.id })
    .orderBy("tour.number", "DESC")
    .getOne();

  if (!currentTour) {
     throw new Error("Aucun tour n'a encore été publié !");
  }

  const maxChars = 10;
  const totalVotes = currentTour.votePropositions.reduce((p,c) => p + c.votes.length,0);
  const chartt = await getchart() as string;
  const chart = Buffer.from(chartt.split(',')[1], 'base64');

  await originalMessage.reply(currentTour.votePropositions.map((vprop) => {
      const percentage = 100 * (vprop.votes.length/ totalVotes);
      return `${vprop.proposition.name}\n${percentageToProgressBar(percentage)} (${percentage.toFixed(2)}%)`;
  }).join("\n"));

  (originalMessage.channel as TextChannel).send({
      embed:  new MessageEmbed()
      .setTitle('A slick little embed')
      .setColor(0xFF0000)
      .setDescription('Hello, this is a slick embed!'),
    files: [{
      attachment: chart,
      name: 'readme'
    }]
  })
  
};
