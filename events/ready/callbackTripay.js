import express from "express";
export default async (client) => {
    try {
        const app = express();

        app.use(express.json());

        app.post("/endpoint-callback", async (req, res) => {
            const data = req.body;

            const buyer = await client.db.Buy.findOne({
                where: {
                    id_transaction: data.reference,
                },
            });

            if (!buyer) {
                console.log(client.messages.shop.transactionNotFound);
            } else {
                const embed = client.function.createEmbed(client);
                embed.setTitle(
                    client.messages.shop.invoiceCallback.replace(
                        "{0}",
                        data.status
                    )
                );
                embed.setDescription(
                    `✨ **Details:**\n` +
                        `- **Reference**: ${data.reference}\n` +
                        `- **Amount Due**: \`${
                            client.config.currency
                        }${data.total_amount.toLocaleString()}\`\n` +
                        `- **Payment Method**: ${data.payment_method}\n\n` +
                        `🚨 **Attention!**\n` +
                        `- ${client.messages.shop.invoiceFooter}\n\n` +
                        client.messages.shop.thankYou
                );

                await client.db.Buy.update(
                    { status: data.status },
                    { where: { id_transaction: data.reference } }
                );

                await client.users.fetch(buyer.id_user).then(async (user) => {
                    await user.send({ embeds: [embed] });
                });
            }

            return res.sendStatus(200);
        });

        app.listen(1234, () => {
            console.log("Callback Tripay is running");
        });
    } catch (err) {
        // Return error
        console.error(client.messages.shop.errorDuringCallback);
        console.error(err);
    }
};
