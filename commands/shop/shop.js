import { SlashCommandBuilder } from "discord.js";
import shop from "../../config/shop.json" with {type: "json"}

export const data = new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Browse the shop and buy items")
    .setIntegrationTypes(0)
    .setContexts(0);

export async function execute(client, interaction) {
    try {
        // Deferred
        await interaction.deferReply();

        let desc = "";
        for (const category in shop) {
            desc += `- ${shop[category].name}\n`;
        }

        // Embed
        const embed = await client.function.createEmbed(client);
        embed.setTitle(client.messages.shop.title);
        embed.setDescription(`${client.messages.shop.description}\n${desc}`);

        // Select menu
        const menuData = Object.keys(shop).map((category) => ({
            label: shop[category].name,
            value: category,
            description: shop[category].description,
            first: false,
        }));

        const menu =
            menuData.length > 0
                ? await client.function.selectMenu(
                      menuData,
                      `${client.messages.shop.prefix}`,
                      client.messages.shop.menuPlaceholder
                  )
                : null;

        //Deploy embed
        const options = {
            embeds: [embed],
        };
        if (menu) {
            options.components = [menu];
        }
        await interaction.editReply(options);
    } catch (error) {
        // Error function
        await client.function.errorCatch(client, interaction, error);
    }
}
