import bot from "../../index.js";
import { productView } from "../../functions/shop.js";

export const customId = `${bot.client.messages.shop.prefix}_nav.*`;
export async function execute(client, interaction) {
    try {
        // Deferred
        await interaction.deferUpdate();

        // Get data
        const [, , category, page] = interaction.customId.split("_");

        // Main function
        const { embed, btn, menu } = await productView(client, category, page);

        // Deploy embed
        const options = {
            embeds: [embed],
            files: [],
            components: [],
        };
        if (menu) {
            options.components.push(menu);
        }
        if (btn) {
            options.components.push(btn);
        }
        await interaction.editReply(options);
    } catch (error) {
        // Error message
        await client.function.errorCatch(client, interaction, error);
    }
}
