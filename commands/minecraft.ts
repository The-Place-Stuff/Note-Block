import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from "discord.js";
import { SlashCommand, User } from "../types/basic";
import { Data } from "../data/utils/DataUtils";

export default class MinecraftLinkCommand implements SlashCommand {
    public data = new SlashCommandBuilder()
        .setName('minecraft')
        .setDescription("Link your Minecraft account to your Discord account")
        .addSubcommand(linkCmd => {
            return linkCmd.setName('link').setDescription('Pair a Minecraft account to your discord user')
            .addStringOption(option => {
                return option.setName('username').setDescription('Input your username!').setRequired(true)
            })
        })
        .addSubcommand(unlinkCmd => {
            return unlinkCmd.setName('unlink').setDescription("Unpair your Minecraft account from your discord user")
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
                content: `Failed to link Minecraft account, **${minecraftName}** is already linked!`
            })
        }

        userData.minecraft_name = minecraftName
        Data.updateUserData(userData, client)

        return interaction.reply({
            content: `Successfully linked **${minecraftName}** to **${user.username}**`,
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
                content: `Failed to unlink Minecraft account, you are not linked to begin with!`,
                ephemeral: true
            })
        }
        userData.minecraft_name = false
        Data.updateUserData(userData, client)

        return interaction.reply({
            content: `Successfully unlinked **${minecraftName}** from **${user.username}**`,
            ephemeral: true
        })
    }
}