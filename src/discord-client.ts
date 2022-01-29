import Discord, { Client, Intents } from 'discord.js';

export class DiscordClient {
    private static _client : Discord.Client;
    private static _initialized : boolean;

    public static get instance() {
        if (!DiscordClient._initialized) {
            throw new Error("Client must be initialized to get instance");
        }

        return DiscordClient._client;
    }

    public static getChannel(id : string) {
        return DiscordClient._client.channels.fetch(id);
    }

    public static async init(token: string) : Promise<Client> {
        if (DiscordClient._client) {
            throw new Error("Client already initialized");
        }

        const intents = new Intents();
        intents.add(Intents.FLAGS.GUILDS);
        intents.add(Intents.FLAGS.GUILD_MESSAGES);
        intents.add(Intents.FLAGS.DIRECT_MESSAGES);

        const client = DiscordClient._client = new Client({
            intents,
            partials: ['MESSAGE', 'CHANNEL']
        });

        await client.login(token);

        return new Promise((res,rej) => {
            client.once('ready', () => {
                DiscordClient._initialized = true;
                res(client);
            });
        });
    }
}