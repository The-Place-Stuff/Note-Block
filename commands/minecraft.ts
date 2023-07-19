import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from "discord.js";
import { SlashCommand, User } from "../types/basic";
import { Data } from "../data/utils/DataUtils";

export default class MinecraftLinkCommand implements SlashCommand {
    public data = new SlashCommandBuilder()
        .setName('minecraft')
        .setDescription("Manages the connection between your Discord and Minecraft accounts.")
        .addSubcommand(linkCmd => {
            return linkCmd.setName('link').setDescription('Pairs your Minecraft: Java Edition and Discord accounts.')
            .addStringOption(option => {
                return option.setName('username').setDescription('Minecraft: Java Edition username').setRequired(true)
            })
        })
        .addSubcommand(unlinkCmd => {
            return unlinkCmd.setName('unlink').setDescription("Removes your Minecraft account from your Discord account.")
        }
    ) as SlashCommandBuilder

    public async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const selectedCommand = interaction.options.getSubcommand(true)
        const userData: User = Data.getOrCreateUser(interaction.user.id, client)

        return selectedCommand == 'link' ? this.onLink(interaction, userData, client) : this.onUnlink(interaction, userData, client)
    }

    //
    // Link subcommand
    //
    private async onLink(interaction: ChatInputCommandInteraction, userData: User, client: Client) {
        const minecraftName = interaction.options.getString('username', true)
        const user = interaction.user

        if (minecraftName == userData.minecraft_name) {
            return interaction.reply({
                content: `Your Discord account is already paired with **${minecraftName}**.`,
                ephemeral: true
            })
        }

        userData.minecraft_name = minecraftName
        Data.updateUserData(userData, client)

        return interaction.reply({
            content: `Your Discord account has been paired with **${minecraftName}**!`,
            ephemeral: true
        })
    }

    //
    // Unlink subcommand
    //
    private async onUnlink(interaction: ChatInputCommandInteraction, userData: User, client: Client) {
        const user = interaction.user
        const minecraftName = userData.minecraft_name

        if (!userData.minecraft_name) {
            return interaction.reply({
                content: `Your Discord account is not paired with a Minecraft account.`,
                ephemeral: true
            })
        }
        userData.minecraft_name = false
        Data.updateUserData(userData, client)

        return interaction.reply({
            content: `Your Discord account has been unpaired from **${minecraftName}**.`,
            ephemeral: true
        })
    }
}