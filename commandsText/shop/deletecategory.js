export default {
    name: "deletecategory",
    description: "Delete category from the shop",
    async execute(client, message) {
        // Reject if not admin
        const shopManagers = client.config.shopManagerId;
        if (!shopManagers.includes(message.author.id)) {
            return;
        }

        const args = message.content.split(" ");

        if (args.length < 2) {
            return message.reply(client.messages.shop.deleteCategoryUsage);
        }

        const [, categoryId] = args;

        // Reject if product invalid
        const category = await client.db.Category.findOne({
            where: {
                id: Number(categoryId),
            },
        });

        if (!category) {
            return message.reply(client.messages.shop.noCategoryList);
        }

        await category.destroy({
            where: {
                id: Number(categoryId),
            },
        });

        return message.reply(client.messages.shop.categoryDeleted);
    },
};
