export default {
    name: "deleteproduct",
    description: "Delete product from the shop",
    async execute(client, message) {
        // Reject if not admin
        const shopManagers = client.config.shopManagerId;
        if (!shopManagers.includes(message.author.id)) {
            return;
        }

        const args = message.content.split(" ");

        if (args.length < 2) {
            return message.reply(client.messages.shop.deleteProductUsage);
        }

        const [, productId] = args;

        // Reject if product invalid
        const product = await client.db.Product.findOne({
            where: {
                id: Number(productId),
            },
        });

        if (!product) {
            return message.reply(client.messages.shop.noProductList);
        }

        await product.destroy({
            where: {
                id: Number(productId),
            },
        });

        return message.reply(client.messages.shop.productDeleted);
    },
};
