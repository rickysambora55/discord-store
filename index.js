import "dotenv/config";
import { Client, GatewayIntentBits, Partials, Collection } from "discord.js";
import eventHandler from "./handlers/eventHandler.js";
import pkg from './package.json' with { type: 'json' };
import config from './config/config.json' with { type: 'json' };
import messages from './config/messages.json' with { type: 'json' };
import * as botFunctions from "./functions/functions.js";
import { fileURLToPath } from "url";
import path from "path";
import db from "./models/index.js";

let client;

async function startBot() {
    client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
        partials: [Partials.User],
    });

    // Make collections
    client.package = pkg;
    client.config = config;
    client.messages = messages;
    client.function = botFunctions;

    client.events = new Collection();
    client.commands = new Collection();
    client.subCommands = new Collection();
    client.subCommandGroups = new Collection();

    // Execute event handlers
    eventHandler(client);

    // Login
    try {
        db.sequelize.sync().then(() => {
            client.db = db;

            client.login(process.env.TOKEN);
        });
    } catch (error) {
        console.error("❌ Failed to login:", error);
    } finally {
        console.log("🤖 Bot is online!");
    }

    return client;
}

// Auto-start if run directly
const isMain =
    process.argv[1] &&
    fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
    await startBot();
}

// Export both startBot and client (initially undefined)
export default {
    startBot,
    get client() {
        return client;
    },
};
