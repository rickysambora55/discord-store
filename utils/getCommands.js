import { join } from "path";
import getFiles from "./getFiles.js";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async (exceptions = [], dir = "commands") => {
    let localCommands = [];

    // Get all the commands from commands folder
    const commandCategories = getFiles(join(__dirname, "..", dir), true);

    // Loop for each command folder
    for (const commandCategory of commandCategories) {
        // Get file
        const commandFiles = getFiles(commandCategory);

        // Loop for each command files
        for (const commandFile of commandFiles) {
            // Get parameters
            const commandObject = await import(pathToFileURL(commandFile).href);

            // Skip command object
            if (commandObject?.data?.name) {
                if (exceptions.includes(commandObject.data.name)) continue;
            } else if (commandObject?.customId) {
                if (exceptions.includes(commandObject.customId)) continue;
            }

            // Push into array
            localCommands.push(commandObject);
        }
    }

    return localCommands;
};
