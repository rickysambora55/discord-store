import bot from "../../index.js";
import { productBuy } from "../../functions/shop.js";

export const customId = `${bot.client.messages.shop.prefix}buy.*`;
export async function execute(client, interaction) {
    try {
        // Deferred
        await interaction.deferUpdate();

        // Get data
        // const [prefix] = interaction.customId.split("_");
        const productId = interaction.values[0];

        // Main function
        const { embed } = await productBuy(client, productId);

        // Deploy embed
        const options = {
            embeds: [embed],
            files: [],
            components: [],
        };
        await interaction.editReply(options);
    } catch (error) {
        // Error message
        await client.function.errorCatch(client, interaction, error);
    }
}
