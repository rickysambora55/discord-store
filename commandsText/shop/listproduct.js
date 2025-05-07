import { listProduct } from "../../functions/shop.js";

export default {
    name: "listproduct",
    description: "List all product from the shop",
    async execute(client, message) {
        // Reject if not admin
        const shopManagers = client.config.shopManagerId;
        if (!shopManagers.includes(message.author.id)) {
            return;
        }

        const { embed, btn } = await listProduct(client, message);

        // Deploy embed
        const options = {
            embeds: [embed],
            files: [],
            components: [],
        };

        if (btn) {
            options.components.push(btn);
        }

        return message.reply(options);
    },
};
