import { ChatInputCommandInteraction, Client, SlashCommandBuilder, SlashCommandStringOption, TextChannel } from "discord.js";

interface SlashCommand {
    data: SlashCommandBuilder,
    execute: (interaction: ChatInputCommandInteraction, client: Client) => void
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
    id: string,
    minecraft_name: string | boolean,
    voice: string
}

type VoiceCategory = {
    name: string,
    description: string,
    voices: VoiceOption[]
}

type VoiceOption = {
    display: string,
    name: string
}

type Voice = {
    id: string,
    service: string
}
