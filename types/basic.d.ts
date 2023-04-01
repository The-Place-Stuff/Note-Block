import { ApplicationCommandOptionBase, ChatInputCommandInteraction, Client, SlashCommandBuilder, SlashCommandStringOption, TextChannel } from "discord.js";

interface SlashCommand {
    data: SlashCommandBuilder,
    execute: (interaction: ChatInputCommandInteraction, client: Client) => void
}

type QueueMessageData = {
    messageID: string,
    channel: TextChannel
}

type Override = {
    overrand: string,
    override: string,
    match_word?: boolean
}