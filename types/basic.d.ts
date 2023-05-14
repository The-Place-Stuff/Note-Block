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

type VoiceCategory = {
    name: string,
    description: string,
    voices: Voice[]
}

type Voice = {
    display: string,
    alias: string,
    id: string,
    exporter: string
}

export declare enum VoiceExporter {
    MICROSOFT = "microsoft",
    TIKTOK = "tiktok",
    SAPI = "sapi",
    UBERDUCK = "uberduck"
}