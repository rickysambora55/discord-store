// Product view
export async function productView(client, category, page = 1) {
    // Validate input
    category = Number(category);

    // Get categories
    const categories = await client.db.Category.findAll({
        raw: true,
    });

    // Get products
    const products = await client.db.Product.findAll({
        where: {
            id_category: category,
        },
        order: [["id", "ASC"]],
        raw: true,
    });
    const product = products[page - 1];

    // Format categories for menu and get info
    let menuData = [];
    let categoryInfo = {};
    categories.forEach((cat) => {
        // Get info
        categoryInfo = cat.id == category ? cat : categoryInfo;

        // Format menu
        if (cat.id == category) {
            menuData.push({
                label: cat.name,
                value: `${cat.id}`,
                description: cat.description,
                first: true,
            });
        } else {
            menuData.push({
                label: cat.name,
                value: `${cat.id}`,
                description: cat.description,
                first: false,
            });
        }
    });

    // Select menu setup
    const menu =
        menuData.length > 0
            ? await client.function.selectMenu(
                  menuData,
                  `${client.messages.shop.prefix}`,
                  client.messages.shop.menuPlaceholder
              )
            : null;

    // Create embed
    let embed = client.function.createEmbed(client);
    embed.setDescription(client.messages.shop.noProductList);
    switch (categoryInfo.id_type) {
        case 0: {
            // Pagination
            const totPage = products.length;
            const btn = await client.function.productPagination(
                client.messages.shop.prefix,
                category,
                product.id,
                page,
                totPage,
                product.buyable
            );

            embed = itemLayout(client, product);
            embed.setTitle(
                `${client.messages.shop.title} - ${categoryInfo.name}`
            );

            embed.setFooter({
                text: `Page ${page}/${totPage}`,
            });

            return { embed, menu, btn };
        }
        case 1: {
            embed = currencyLayout(client, products);
            embed.setTitle(
                `${client.messages.shop.title} - ${categoryInfo.name}`
            );

            return { embed, menu };
        }
    }

    return { embed, menu };
}

// Item layout
function itemLayout(client, product) {
    const embed = client.function.createEmbed(client);

    const price = product.price;
    const discount = (100 - product.discount) / 100;
    const isSale = product.discount > 0;
    const stPrice = `~~$${price.toLocaleString()}~~ `;
    const isAvailable = product.buyable;
    const outStock = " _(Out of stock)_";
    embed.setDescription(
        `### **${product.name}**${isAvailable ? "" : outStock}\n` +
            `💵 **Price:** ${isSale ? stPrice : ""}\`$${(
                price * discount
            ).toLocaleString()}\`\n`
    );

    // Set picture
    if (product.picture) {
        embed.setImage(product.picture);
    }

    return embed;
}

function currencyLayout(client, products) {
    const embed = client.function.createEmbed(client);

    if (products.length > 0) {
        let desc = "";
        products.forEach((product) => {
            desc += `- ${product.name} - $${product.price.toLocaleString()}\n`;
        });
        embed.setDescription(desc);
    } else {
        embed.setDescription(client.messages.shop.noProductList);
    }
    return embed;
}
