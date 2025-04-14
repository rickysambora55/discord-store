import { join } from "path";
import getFiles from "../utils/getFiles.js";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default (client) => {
    // Return dir in events
    const eventFolders = getFiles(join(__dirname, "..", "events"), true);

    // Loop for each foldername
    for (const eventFolder of eventFolders) {
        // Get files
        const eventFiles = getFiles(eventFolder);

        // Set folder name as event name
        let eventName = eventFolder.replace(/\\/g, "/").split("/").pop();

        // There is no validations event. It will be triggered on interactionCreate instead
        if (eventName === "validations") eventName = "interactionCreate";

        // Execute the event based on the eventName
        client.on(eventName, async (...arg) => {
            for (const eventFile of eventFiles) {
                const { default: eventFunction } = await import(
                    pathToFileURL(eventFile).href
                );
                await eventFunction(client, ...arg);
            }
        });
    }
};
