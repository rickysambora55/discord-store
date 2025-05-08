import axios from "axios";

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

            embed = itemLayout(client, product, categoryInfo);
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
function itemLayout(client, product, category) {
    const embed = client.function.createEmbed(client);

    // Get product details
    const price = product.price;
    const totalDiscount =
        1 - (1 - product.discount / 100) * (1 - category.globalDiscount / 100);
    const isSale = product.discount > 0;

    // Format price with sale prices
    const stPrice = `~~${client.config.currency}${price.toLocaleString()}~~ `;
    const formattedPrice = `\`${client.config.currency}${(
        price *
        (1 - totalDiscount)
    ).toLocaleString()}\``;
    const finalPrice = `${isSale ? stPrice : ""} ${formattedPrice}${
        isSale ? ` (🔥 ${Math.round(totalDiscount * 100)}% off)` : ""
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
            const totalDiscount =
                1 -
                (1 - product.discount / 100) *
                    (1 - categoryInfo.globalDiscount / 100);
            const isSale = product.discount > 0;

            // Format price with sale prices
            const stPrice = `~~${
                client.config.currency
            }${price.toLocaleString()}~~ `;
            const formattedPrice = `\`${client.config.currency}${(
                price *
                (1 - totalDiscount)
            ).toLocaleString()}\``;
            const finalPrice = `${isSale ? stPrice : ""} ${formattedPrice}${
                isSale ? ` (🔥 ${Math.round(totalDiscount * 100)}% off)` : ""
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

export async function productBuy(client, productId, payload) {
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

    const subTotal = payload.data.order_items.reduce((sum, item) => {
        return sum + item.subtotal;
    }, 0);
    const dateExpired = new Date(
        payload.data.expired_time * 1000
    ).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta",
    });

    const embed = client.function.createEmbed(client);
    embed.setTitle(client.messages.shop.invoiceTitle);
    embed.setDescription(
        `${client.messages.shop.invoiceDesc.replace("{1}", product.name)}\n\n` +
            `✨ **Details:**\n` +
            `- **Reference**: ${payload.data.reference}\n` +
            `- **Product**: ${product.name}\n` +
            `- **Amount Due**: \`${
                client.config.currency
            }${subTotal.toLocaleString()}\`\n` +
            `- **Payment Method**: ${payload.data.payment_name}\n\n` +
            `🚨 **Attention!**\n` +
            `- ${client.messages.shop.invoiceFooter}\n\n` +
            `⏰ **Expiration Date**: **${dateExpired} GMT+7**\n\n` +
            client.messages.shop.thankYou
    );

    return { embed };
}

export async function productBuyHandle(client, interaction, productId) {
    const product = await client.db.Product.findOne({
        where: {
            id: productId,
        },
        raw: true,
    });

    if (!product) {
        return interaction.reply({
            embeds: [
                client.function.createEmbed(
                    client,
                    client.messages.shop.error,
                    client.messages.shop.noProductList
                ),
            ],
        });
    }

    // Get category
    const category = client.db.Category.findOne({
        where: {
            id: product.id_category,
        },
        raw: true,
    });

    const member = await interaction.client.users.fetch(interaction.user.id);
    const totalDiscount =
        1 - (1 - product.discount / 100) * (1 - category.globalDiscount / 100);
    // const productName = product.name
    // const productPrice = product.price * (1 - totalDiscount);
    let paymentGW = {};

    // Only one payment method predefined
    try {
        const responses = await axios.post("https://dummyjson.com/test");

        if (responses && responses.status === 200) {
            paymentGW = responses.data;

            // Dummy data
            paymentGW = {
                success: true,
                message: "",
                data: {
                    reference: "T0001000000000000006",
                    merchant_ref: "INV345675",
                    payment_selection_type: "static",
                    payment_method: "BRIVA",
                    payment_name: "BRI Virtual Account",
                    customer_name: "Nama Pelanggan",
                    customer_email: "emailpelanggan@domain.com",
                    customer_phone: "081234567890",
                    callback_url: "https://domainanda.com/callback",
                    return_url: "https://domainanda.com/redirect",
                    amount: 1000000,
                    fee_merchant: 1500,
                    fee_customer: 0,
                    total_fee: 1500,
                    amount_received: 998500,
                    pay_code: "57585748548596587",
                    pay_url: null,
                    checkout_url:
                        "https://tripay.co.id/checkout/T0001000000000000006",
                    status: "UNPAID",
                    expired_time: 1582855837,
                    order_items: [
                        {
                            sku: "PRODUK1",
                            name: "Nama Produk 1",
                            price: 500000,
                            quantity: 1,
                            subtotal: 500000,
                            product_url:
                                "https://tokokamu.com/product/nama-produk-1",
                            image_url:
                                "https://tokokamu.com/product/nama-produk-1.jpg",
                        },
                        {
                            sku: "PRODUK2",
                            name: "Nama Produk 2",
                            price: 500000,
                            quantity: 1,
                            subtotal: 500000,
                            product_url:
                                "https://tokokamu.com/product/nama-produk-2",
                            image_url:
                                "https://tokokamu.com/product/nama-produk-2.jpg",
                        },
                    ],
                    instructions: [
                        {
                            title: "Internet Banking",
                            steps: [
                                "Login ke internet banking Bank BRI Anda",
                                "Pilih menu <b>Pembayaran</b> lalu klik menu <b>BRIVA</b>",
                                "Pilih rekening sumber dan masukkan Kode Bayar (<b>57585748548596587</b>) lalu klik <b>Kirim</b>",
                                "Detail transaksi akan ditampilkan, pastikan data sudah sesuai",
                                "Masukkan kata sandi ibanking lalu klik <b>Request</b> untuk mengirim m-PIN ke nomor HP Anda",
                                "Periksa HP Anda dan masukkan m-PIN yang diterima lalu klik <b>Kirim</b>",
                                "Transaksi sukses, simpan bukti transaksi Anda",
                            ],
                        },
                    ],
                    qr_string: null,
                    qr_url: null,
                },
            };
        }
    } catch (error) {
        console.error(client.messages.shop.errorApi);
        console.error(error);
    }

    // Main function
    const { embed } = await productBuy(client, productId, paymentGW);

    // Deploy embed
    const options = {
        embeds: [embed],
        files: [],
        components: [],
    };

    try {
        const invoice = await client.users.send(member.id, options);

        await client.db.Buy.create({
            id_user: interaction.user.id,
            id_product: productId,
            id_transaction: paymentGW.data.reference,
            id_message: invoice.id,
            status: paymentGW.data.status,
        });
    } catch (error) {
        console.error(
            client.messages.general.errorDM.replace("{0}", member.username)
        );
        console.error(error);
    }
}

export async function listProduct(client, message, page = 1) {
    const limit = client.config.shop.maxList;
    const offset = client.config.shop.maxList * (page - 1);

    const products = await client.db.Product.findAndCountAll({
        limit: limit,
        offset: offset,
        raw: true,
    });

    if (products.count === 0) {
        return message.reply(client.messages.shop.noProductList);
    }

    // Counting page
    const totPage = Math.ceil(products.count / client.config.shop.maxList);

    // Pagination
    const btn = await client.function.pagination(
        client.messages.shop.prefix,
        "listproduct",
        page,
        totPage,
        false,
        `_${message.id}`
    );

    const embed = client.function.createEmbed(client, "List of products 📦");
    embed.setDescription(
        `ID - Name\n${products.rows
            .map((product) => `**[${product.id}]** ${product.name}`)
            .join("\n")}`
    );

    return { embed, btn };
}

export async function listCategory(client, message, page = 1) {
    const limit = client.config.shop.maxList;
    const offset = client.config.shop.maxList * (page - 1);

    const categories = await client.db.Category.findAndCountAll({
        limit: limit,
        offset: offset,
        raw: true,
    });

    if (categories.count === 0) {
        return message.reply(client.messages.shop.categoryNotFound);
    }

    // Counting page
    const totPage = Math.ceil(categories.count / client.config.shop.maxList);

    // Pagination
    const btn = await client.function.pagination(
        client.messages.shop.prefix,
        "listproduct",
        page,
        totPage,
        false,
        `_${message.id}`
    );

    const embed = client.function.createEmbed(client, "List of categories 📖");
    embed.setDescription(
        `ID - Name\n${categories.rows
            .map((product) => `**[${product.id}]** ${product.name}`)
            .join("\n")}`
    );

    return { embed, btn };
}
