export default {
    name: "addproduct",
    description: "Add product to the shop",
    async execute(client, message) {
        // Reject if not admin
        const shopManagers = client.config.shopManagerId;
        if (!shopManagers.includes(message.author.id)) {
            return;
        }

        const args = message.content.split(" ");

        if (args.length < 4) {
            return message.reply(client.messages.shop.addProductUsage);
        }

        const [, name, category, price, discount, picture, buyable] = args;

        // Validation
        if (category && isNaN(Number(category))) {
            return message.reply(
                client.messages.shop.isNotNumber.replace("{0}", "Category")
            );
        }

        if (price && isNaN(Number(price))) {
            return message.reply(
                client.messages.shop.isNotNumber.replace("{0}", "Price")
            );
        }

        if (discount && isNaN(Number(discount))) {
            return message.reply(
                client.messages.shop.isNotNumber.replace("{0}", "Price")
            );
        }

        if (picture && !client.function.isValidImageUrl(picture)) {
            return message.reply(client.messages.shop.invalidImageUrl);
        }

        if (
            buyable &&
            !["true", "false", "1", "0", "yes", "no"].includes(buyable)
        ) {
            return message.reply(client.messages.shop.invalidBuyable);
        }

        // Reject if category invalid
        const categoryDetails = await client.db.Category.findOne({
            where: {
                id: Number(category),
            },
        });

        if (!categoryDetails) {
            return message.reply(client.messages.shop.categoryNotFound);
        }

        const newName = name.replace(/_/g, " ");
        const newPrice = Number(price);
        const newDiscount = discount ? Number(discount) : 0;
        let newBuyable = 0;

        if (buyable === "true" || buyable == "1" || buyable === "yes") {
            newBuyable = 1;
        }

        await client.db.Product.create({
            name: newName,
            id_category: categoryDetails.id,
            price: newPrice,
            discount: newDiscount,
            picture: picture,
            buyable: newBuyable,
        });

        return message.reply(client.messages.shop.productAdded);
    },
};
