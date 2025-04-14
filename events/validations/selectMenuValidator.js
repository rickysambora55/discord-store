import getSelects from "../../utils/getCommands.js";

export default async (client, interaction) => {
    // Check if interaction is a button
    if (!interaction.isAnySelectMenu()) return;

    // Get select menu files
    const selects = await getSelects([], "selects");
    const selectObject = selects.find((slc) => {
        const idPattern = new RegExp(`^${slc.customId}`);
        return idPattern.test(interaction.customId);
    });

    // Return if not exist
    if (!selectObject) return;

    // Check if button is dev only
    if (
        selectObject.devOnly &&
        !client.config.devId.includes(interaction.member.id)
    ) {
        const embed = await client.function.descEmbed(
            client,
            client.messages.general.devOnly,
            client.config.color.error
        );
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Check if command is local only
    if (
        selectObject.testMode &&
        interaction?.guild?.id !== process.env.LOCALSERVER
    ) {
        const embed = await client.function.descEmbed(
            client,
            client.messages.general.testMode,
            client.config.color.error
        );
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Check if user has permissions
    for (const permission of selectObject.userPermissions || []) {
        if (!interaction.member.permissions.has(permission)) {
            const embed = await client.function.descEmbed(
                client,
                client.messages.general.userNoPermissions,
                client.config.color.error
            );
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }

    // Check if bot has permissions
    if (interaction.guild) {
        const bot = interaction.guild.members.me;
        for (const permission of selectObject.botPermissions || []) {
            if (!bot.permissions.has(permission)) {
                const embed = await client.function.descEmbed(
                    client,
                    client.messages.general.botNoPermissions,
                    client.config.color.error
                );
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
    }

    //Check if the button is yours
    if (interaction.message.interaction && selectObject.selfInteract) {
        if (interaction.message.interaction.user.id !== interaction.user.id) {
            const embed = await client.function.descEmbed(
                client,
                client.messages.general.cannotUseInteraction,
                client.config.color.error
            );
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }

    // Execute the code
    try {
        await selectObject.execute(client, interaction);
    } catch (err) {
        // Return error
        console.log(client.messages.general.errorValidatingSelectMenu, err);
    }
};
