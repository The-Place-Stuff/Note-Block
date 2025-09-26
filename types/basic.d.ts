import { ChatInputCommandInteraction, Client, SlashCommandBuilder, SlashCommandStringOption, TextChannel } from "discord.js";

type FileGeneratingStatus = "error" | "generating" | "ready"

interface SlashCommand {
    data: SlashCommandBuilder,
    execute: (interaction: ChatInputCommandInteraction, client: Client) => void
}

interface AudioService {
    id: string,
    export: (text: string, voice: string, outputDir: string) => Promise<void>
}

type QueueMessageData = {
    messageID: string,
    channel: TextChannel,
    isMinecraft: boolean
}

type Override = {
    overrand: string,
    override: string,
    match_word?: boolean
}

type UserBase = User[]

type User = {
    favorites: string[],
    id: string,
    minecraft_name: string | boolean,
    voice: string
}

type VoiceCategory = {
    name: string,
    description: string,
    voices: string[]
}

type VoiceOption = {
    display: string,
    name: string
}

type Voice = {
    id: string,
    name: string,
    service: string
}
