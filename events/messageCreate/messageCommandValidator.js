import getCommands from "../../utils/getCommands.js";

export default async (client, message) => {
    // Ignore bots and non-text messages
    if (message.author.bot || !message.guild) return;

    const prefix = client.config.chatCommandPrefix;
    if (!message.content.startsWith(prefix)) return;

    // Extract command and args
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Load text commands
    const localCommands = await getCommands([], "commandsText");

    // Find matching command
    const commandObject = localCommands.find(
        (cmd) =>
            cmd.default?.name === commandName ||
            cmd.default?.aliases?.includes(commandName)
    );
    if (!commandObject) return;

    // Check dev only
    if (
        commandObject.devOnly &&
        !client.config.devId.includes(message.author.id)
    ) {
        const embed = await client.function.descEmbed(
            client,
            client.messages.general.devOnly,
            client.config.color.error
        );
        return message.reply({ embeds: [embed], ephemeral: true });
    }

    // Check permissions
    for (const permission of commandObject.userPermissions || []) {
        if (!message.member.permissions.has(permission)) {
            const embed = await client.function.descEmbed(
                client,
                client.messages.general.userNoPermissions,
                client.config.color.error
            );
            return message.reply({ embeds: [embed], ephemeral: true });
        }
    }

    // Run command
    try {
        await commandObject.default?.execute(client, message, args);
    } catch (err) {
        console.log(client.messages.general.errorValidatingCommandText, err);
    }
};
