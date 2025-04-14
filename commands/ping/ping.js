import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Get bot ping")
    .setIntegrationTypes(0)
    .setContexts(0);

export async function execute(client, interaction) {
    try {
        // Deferred
        const message = await interaction.deferReply({ fetchReply: true });

        // API
        const apiLatency = client.ws.ping ? client.ws.ping + "ms" : "Down";

        // DC
        const discordLatency =
            message.createdTimestamp && interaction.createdTimestamp
                ? message.createdTimestamp - interaction.createdTimestamp + "ms"
                : "Down";

        // Embed
        const embed = await client.function.descEmbed(
            client,
            client.messages.ping.desc
        );

        await embed.addFields(
            {
                name: `Interaction :round_pushpin:`,
                value: `${discordLatency}`,
                inline: false,
            },
            {
                name: `API :pencil:`,
                value: `${apiLatency}`,
                inline: false,
            }
        );

        //Deploy embed
        const options = {
            embeds: [embed],
        };
        await interaction.editReply(options);
    } catch (error) {
        // Error function
        await client.function.errorCatch(client, interaction, error);
    }
}
