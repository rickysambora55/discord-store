export default {
    name: "addcategory",
    description: "Add category to the shop",
    async execute(client, message) {
        // Reject if not admin
        const shopManagers = client.config.shopManagerId;
        if (!shopManagers.includes(message.author.id)) {
            return;
        }

        const args = message.content.split(" ");

        if (args.length < 4) {
            return message.reply(client.messages.shop.addCategoryUsage);
        }

        const [, name, type, description, discount] = args;

        // Validation
        let typeNum = 0;
        switch (type) {
            case "currency":
                typeNum = 1;
                break;
            case "item":
                typeNum = 0;
                break;
            default:
                typeNum = 0;
                break;
        }

        if (discount && isNaN(Number(discount))) {
            return message.reply(
                client.messages.shop.isNotNumber.replace("{0}", "Discount")
            );
        }

        const newName = name.replace(/_/g, " ");
        const newDesc = description.replace(/_/g, " ");
        const newDiscount = discount ? Number(discount) : 0;

        await client.db.Category.create({
            name: newName,
            id_type: typeNum,
            description: newDesc,
            globalDiscount: newDiscount,
        });

        return message.reply(client.messages.shop.categoryAdded);
    },
};
