import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Browse the shop and buy items")
    .setIntegrationTypes(0)
    .setContexts(0);

export async function execute(client, interaction) {
    try {
        // Deferred
        await interaction.deferReply();

        // Get categories
        const categories = await client.db.Category.findAll({
            raw: true,
        });

        // Format categories for menu and list
        let desc = "";
        let menuData = [];
        categories.forEach((category) => {
            desc += `- **${category.name}** - ${category.description}\n`;

            menuData.push({
                label: category.name,
                value: `${category.id}`,
                description: category.description,
                first: false,
            });
        });

        // Embed
        const embed = await client.function.createEmbed(client);
        embed.setTitle(client.messages.shop.title);
        embed.setDescription(`${client.messages.shop.description}\n${desc}`);

        // Select menu setup
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
