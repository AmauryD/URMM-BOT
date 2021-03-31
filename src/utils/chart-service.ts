import { readFile } from "fs/promises";
import { Tour } from "../models/tour";
import puppeteer, { Browser } from "puppeteer";
import stc from "string-to-color";

export class ChartService {
    private static _browser : Browser | null = null;

    static async  init() {
        this._browser = await puppeteer.launch({
            headless: true,
            executablePath: '/usr/bin/chromium-browser',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }); 
    }

    static async destroy() {
        return this._browser?.close();
    }

    static async generateChart(results : Tour) {
        let totalVotes = results.votePropositions.reduce((p,c) => p + c.votes.length,0);
        const adjustedVotes = totalVotes === 0 ? 1 : totalVotes;
        const votes: string[] = [];
        const backgroundcolors : string[] = [];

        const labels = results.votePropositions
        .sort((a,b) => {
            const apercentage = 100 * (a.votes.length/ adjustedVotes);
            const bpercentage = 100 * (b.votes.length/ adjustedVotes);
            return bpercentage - apercentage;
        }).map((vprop) => {
            const percentage = 100 * (vprop.votes.length/ adjustedVotes);
            votes.push(vprop.votes.length.toString());
            backgroundcolors.push(`#${stc(vprop.proposition.name)}`);
            return `${vprop.proposition.name}\n ${percentage.toFixed(2)}%`;
        });

        const page = await this._browser!.newPage();
        const html = await readFile("./chart.html","utf-8");
        

        await page.setContent(html.replace("{{CHARTCODE}}",JSON.stringify({
            type: 'horizontalBar',
            data: {
                labels: labels,
                datasets: [{
                    label: `# de votes (${totalVotes} votes)`,
                    data: votes,
                    backgroundColor: backgroundcolors
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        })));
        await page.waitForSelector('#chart',{
            timeout : 5000
        });

        const image = await (await page.$("#chart"))!.screenshot({
         omitBackground: false,
        }) as Buffer;

        page.close();

        return image;
    }
}