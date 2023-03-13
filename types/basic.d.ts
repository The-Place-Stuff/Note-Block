import { ApplicationCommandOptionBase, ChatInputCommandInteraction, Client, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";

interface SlashCommand {
    data: SlashCommandBuilder,
    execute: (interaction: ChatInputCommandInteraction, client: Client) => void
}