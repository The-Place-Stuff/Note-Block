import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from "discord.js";
import { SlashCommand, User } from "../types/basic";
import { Data } from "../data/utils/DataUtils";

export default class MinecraftLinkCommand implements SlashCommand {
    public data = new SlashCommandBuilder()
        .setName('minecraft')
        .setDescription("Link your Minecraft account to your Discord account")
        .addStringOption(minecraftUsername =>
        {
            return minecraftUsername
            .setName('username')
            .setDescription('What is your Minecraft username?')
            .setRequired(true)
        }
    ) as SlashCommandBuilder

    public async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const minecraftUsername = interaction.options.getString('username', true)

        const userData: User = Data.getUserData(interaction.user.id) ? Data.getUserData(interaction.user.id) as User : Data.writeNewUser({
            id: interaction.user.id,
            minecraft_name: false,
            voice: "none"
        }, client)

        userData.minecraft_name = minecraftUsername

        Data.updateUserData(userData, client)

        return interaction.reply({
            content: `Your Minecraft username has been set to **${minecraftUsername}**`,
            ephemeral: true
        })
    }
}