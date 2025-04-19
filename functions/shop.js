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
                  `${client.messages.shop.prefix}nav`,
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
            const { embed, menuBuy } = await currencyLayout(
                client,
                category,
                products
            );
            embed.setTitle(
                `${client.messages.shop.title} - ${categoryInfo.name}`
            );

            return { embed, menu, menuBuy };
        }
    }

    return { embed, menu };
}

// Item layout
function itemLayout(client, product) {
    const embed = client.function.createEmbed(client);

    // Get product details
    const price = product.price;
    const discount = (100 - product.discount) / 100;
    const isSale = product.discount > 0;

    // Format price with sale prices
    const stPrice = `~~${client.config.currency}${price.toLocaleString()}~~ `;
    const formattedPrice = `\`${client.config.currency}${(
        price * discount
    ).toLocaleString()}\``;
    const finalPrice = `${isSale ? stPrice : ""} ${formattedPrice}${
        isSale ? ` (🔥 ${product.discount}% off)` : ""
    }`;

    // Availability
    const isAvailable = product.buyable;
    const outStock = " _(Out of stock)_";

    // Build the product description
    let productDescription = `**Product** 🛍️\n`;

    productDescription += `- **Name**: ${product.name}\n`;
    productDescription += `- **Price**: ${isAvailable ? finalPrice : outStock}`;

    embed.setDescription(productDescription);

    // Set picture if available
    if (product.picture) {
        embed.setImage(product.picture);
    }

    return embed;
}

async function currencyLayout(client, category, products) {
    const embed = client.function.createEmbed(client);

    let menuData = [];

    // Get category name
    const categoryInfo = await client.db.Category.findOne({
        where: {
            id: category,
        },
        raw: true,
    });

    if (products.length > 0) {
        let desc = "**🌟 Available Products**\n\n";

        products.forEach((product) => {
            const price = product.price;
            const discount = (100 - product.discount) / 100;
            const isSale = product.discount > 0;

            // Format price with sale prices
            const stPrice = `~~${
                client.config.currency
            }${price.toLocaleString()}~~ `;
            const formattedPrice = `\`${client.config.currency}${(
                price * discount
            ).toLocaleString()}\``;
            const finalPrice = `${isSale ? stPrice : ""} ${formattedPrice}${
                isSale ? ` (🔥 ${product.discount}% off)` : ""
            }`;

            // Availability
            const isAvailable = product.buyable;
            const outStock = " _(Out of stock)_";

            desc += `**${product.name}**\n`;
            desc += `- ${isAvailable ? finalPrice : outStock}\n`;

            // Menu
            menuData.push({
                label: product.name,
                value: `${product.id}`,
                description: `${categoryInfo.name} ${product.name}`,
                first: false,
            });
        });

        embed.setDescription(desc);
    } else {
        embed.setDescription(client.messages.shop.noProductList);
    }

    // Select menu setup
    const menuBuy =
        menuData.length > 0
            ? client.function.selectMenu(
                  menuData,
                  `${client.messages.shop.prefix}buy`,
                  client.messages.shop.menuBuyPlaceholder
              )
            : null;

    return { embed, menuBuy };
}

export async function productBuy(client, productId) {
    const product = await client.db.Product.findOne({
        where: {
            id: productId,
        },
        raw: true,
    });

    if (!product) {
        return {
            embed: client.function.createEmbed(
                client,
                client.messages.shop.error,
                client.messages.shop.noProductList
            ),
        };
    }

    const embed = client.function.createEmbed(client);
    embed.setTitle(client.messages.shop.invoiceTitle);
    embed.setDescription(
        `${client.messages.shop.invoiceDesc.replace("{1}", product.name)}\n\n` +
            `✨ **Details:**\n` +
            `- **Product**: ${product.name}\n` +
            `- **Amount Due**: \`${client.config.currency}99.410\`\n\n` +
            `🚨 **Attention!**\n` +
            `- ${client.messages.shop.invoiceFooter}\n\n` +
            `⏰ **Expiration Date**: **99 April 2025, 00:49 WIB**\n\n` +
            client.messages.shop.thankYou
    );

    return { embed };
}
