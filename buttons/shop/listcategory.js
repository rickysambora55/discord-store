import bot from "../../index.js";
import { listCategory } from "../../functions/shop.js";

export const customId = `${bot.client.messages.shop.prefix}_listcategory.*`;
export async function execute(client, interaction) {
    try {
        // Deferred
        await interaction.deferUpdate();

        // Get data
        const [, , page, , , messageId] = interaction.customId.split("_");

        // Main function
        const { embed, btn } = await listCategory(client, messageId, page);

        // Deploy embed
        const options = {
            embeds: [embed],
            files: [],
            components: [],
        };
        if (btn) {
            options.components.push(btn);
        }
        await interaction.editReply(options);
    } catch (error) {
        // Error message
        await client.function.errorCatch(client, interaction, error);
    }
}
