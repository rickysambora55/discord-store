import getCommands from "../../utils/getCommands.js";

export default async (client, interaction) => {
    // Check if the interaction is command
    if (!interaction.isAutocomplete()) return;

    // Get commands from file and find corresponding command
    const localCommands = await getCommands([], "commands");
    const commandObject = localCommands.find(
        (cmd) => cmd.data?.name === interaction.commandName
    );

    // Return if not exist
    if (!commandObject) return;

    try {
        await commandObject.autocomplete(client, interaction);
    } catch (err) {
        console.error(client.messages.general.errorValidatingAutocomplete, err);
        return;
    }
};
