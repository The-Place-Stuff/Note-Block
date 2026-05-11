import { ChatInputCommandInteraction, Client, Message, SlashCommandBuilder, SlashCommandStringOption, TextChannel } from "discord.js";

interface SlashCommand {
    data: SlashCommandBuilder,
    execute: (interaction: ChatInputCommandInteraction, client: Client) => void
}

interface AudioService {
    id: string,
    export: (text: string, voice: VoiceData, outputDir: string) => Promise<void>
}

type QueueMessageData = {
    message: Message,
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
    voices: string[],
    enabled?: boolean
}

type VoiceOption = {
    display: string,
    name: string
}

type Voice = {
    name: string,
    service: string
    data: VoiceData
}

type VoiceData = StandardVoiceData | EmptyVoiceData | SamVoiceData | TalkmodachiVoiceData

type StandardVoiceData = {
    id: string
}

type EmptyVoiceData = {}

type SamVoiceData = {
    pitch: number,
    speed: number,
    mouth: number,
    throat: number
}

type TalkmodachiVoiceData = {
    pitch: number,
    speed: number,
    quality: number,
    tone: number,
    accent: number,
    intonation: number,
    lang: 'useng' | 'eueng'
}
