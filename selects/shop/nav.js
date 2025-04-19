import bot from "../../index.js";
import { productView } from "../../functions/shop.js";

export const customId = `${bot.client.messages.shop.prefix}nav.*`;
export async function execute(client, interaction) {
    try {
        // Deferred
        await interaction.deferUpdate();

        // Get data
        // const [prefix] = interaction.customId.split("_");
        const category = interaction.values[0];

        // Main function
        const { embed, btn, menu, menuBuy } = await productView(
            client,
            category
        );

        // Deploy embed
        const options = {
            embeds: [embed],
            files: [],
            components: [],
        };

        if (menu) {
            options.components.push(menu);
        }
        if (menuBuy) {
            options.components.push(menuBuy);
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
