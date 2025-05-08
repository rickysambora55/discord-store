import bot from "../../index.js";
import { productBuyHandle } from "../../functions/shop.js";

export const customId = `${bot.client.messages.shop.prefix}_buy.*`;
export async function execute(client, interaction) {
    try {
        // Deferred
        await interaction.deferReply({ ephemeral: true });

        // Get data
        const [, , , productId] = interaction.customId.split("_");

        await productBuyHandle(client, interaction, productId);

        await interaction.editReply({
            content: "Check your DM!",
            ephemeral: true,
        });
    } catch (error) {
        // Error message
        await client.function.errorCatch(client, interaction, error);
    }
}
