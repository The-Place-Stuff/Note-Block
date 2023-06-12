import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from "discord.js";
import { SlashCommand, VoiceEntry } from "../types/basic";
import { Data } from "../data/DataUtils";

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

        const userData: VoiceEntry = Data.getUserData(interaction.user.id) ? Data.getUserData(interaction.user.id) as VoiceEntry : Data.writeNewUser({
            id: interaction.user.id,
            minecraft_name: false,
            voice: "none"
        }, client)

        userData.minecraft_name = minecraftUsername

        Data.updateUserData(userData, client)

        return interaction.reply({
            content: `Your Minecraft username has been set to **${minecraftUsername}**`
        })
    }
}