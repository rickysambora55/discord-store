import {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from "discord.js";

//Embed template
export function createEmbed(
    client,
    title,
    desc,
    footer,
    color = client.config.color.bot
) {
    const embed = new EmbedBuilder().setColor(parseInt(color)).setTimestamp();

    if (title) {
        embed.setTitle(title);
    }

    if (desc) {
        embed.setDescription(desc);
    }

    if (footer) {
        embed.setFooter({
            text: footer,
        });
    }
    return embed;
}

// Embed template with description only
export function descEmbed(client, desc, color = client.config.color.bot) {
    const embed = new EmbedBuilder()
        .setColor(parseInt(color))
        .setDescription(`${desc}`);
    return embed;
}

// Remove duplicates object
export function removeDuplicates(arr, prop) {
    // Use a Set to keep track of unique property values
    const seen = new Set();
    // Filter the array to keep only the first occurrence of each property value
    return arr.filter((obj) => {
        // Check if the property value is already in the Set
        if (seen.has(obj[prop])) {
            // If it is, return false to filter out this object
            return false;
        }
        // If not, add the property value to the Set and return true to keep this object
        seen.add(obj[prop]);
        return true;
    });
}

// Select menu
export async function selectMenu(data, id, placeholder) {
    var list = [];
    const s = new ActionRowBuilder();
    for (const optionData of data) {
        const { label, value, description, emoji, first = false } = optionData;

        const option = await selectOptions(
            label,
            value,
            description,
            emoji,
            first
        );

        list.push(option);
    }

    const menu = new StringSelectMenuBuilder()
        .setCustomId(id)
        .setPlaceholder(placeholder)
        .addOptions(list);
    s.addComponents(menu);

    return s;
}

// Create select menu options
export async function selectOptions(label, value, description, emoji, first) {
    let s = new StringSelectMenuOptionBuilder()
        .setLabel(label)
        .setValue(value)
        .setDefault(first);
    if (description || description != "") s.setDescription(description);
    if (emoji) s.setEmoji(emoji);

    return s;
}

// Error catch
export async function errorCatch(client, interaction, error) {
    // Get data
    const interact = interaction.isAutocomplete()
        ? interaction.options.getFocused()
        : !interaction.isChatInputCommand()
        ? interaction.customId
        : interaction;
    const type = interaction.type;
    const server = interaction?.guild?.name || "Non Guild";
    const serverid = interaction?.guild?.id || "Non Guild";
    const username = interaction.user.username;
    const userid = interaction.user.id;
    const date = new Date();
    const dateFormatted = date.toLocaleString("en-GB", {
        timeZone: "Asia/Jakarta",
    });

    // Log to console
    console.log(
        client.messages.general.errorCode.replace(
            "{0}",
            `[${type}] ${interact}`
        )
    );
    console.log(
        `${client.messages.general.errorPrefix} Date: ${dateFormatted}`
    );
    console.log(
        `${client.messages.general.errorPrefix} Server: '${server}' (${serverid})`
    );
    console.log(
        `${client.messages.general.errorPrefix} Executor: '${username}' (${userid})`
    );
    console.log(error);

    // Send to developer
    const embed = descEmbed(
        client,
        `### An error occurred`,
        client.config.color.danger
    );
    embed.setTitle("An error occurred");
    embed.setDescription(null);
    embed.addFields(
        {
            name: `Error Code`,
            value: `${`${error}`.split(" ").slice(1).join(" ")}`,
            inline: false,
        },
        {
            name: `Interaction`,
            value: `[${type}] ${interact}`,
            inline: false,
        },
        {
            name: `Date`,
            value: `${dateFormatted}`,
            inline: false,
        },
        {
            name: `Server`,
            value: `'${server}' (${serverid})`,
            inline: false,
        },
        {
            name: `Executor`,
            value: `'${username}' (${userid})`,
            inline: false,
        }
    );

    const response = descEmbed(
        client,
        `${
            ["missing access", "permission", "permissions"].some((str) =>
                `${error}`.toLowerCase().includes(str)
            )
                ? `### ${`${error}`.split(" ").slice(1).join(" ")}\n${
                      client.messages.general.error
                  }`
                : ["etimedout", "timedout", "timeout"].some((str) =>
                      `${error}`.toLowerCase().includes(str)
                  )
                ? client.messages.general.serverBusy
                : client.messages.general.error
        }`,
        client.config.color.danger
    );

    // Reply interaction
    await interaction.editReply({
        content: "",
        embeds: [response],
        components: [],
        files: [],
    });
}
