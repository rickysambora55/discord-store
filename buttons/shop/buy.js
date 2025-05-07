import axios from "axios";
import bot from "../../index.js";
import { productBuy } from "../../functions/shop.js";

export const customId = `${bot.client.messages.shop.prefix}_buy.*`;
export async function execute(client, interaction) {
    try {
        // Deferred
        await interaction.deferReply({ ephemeral: true });

        // Get data
        const [, , , productId] = interaction.customId.split("_");
        const member = await interaction.client.users.fetch(
            interaction.user.id
        );
        let paymentGW = {};

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

        await interaction.editReply({
            content: "Check your DM!",
            ephemeral: true,
        });
    } catch (error) {
        // Error message
        await client.function.errorCatch(client, interaction, error);
    }
}
