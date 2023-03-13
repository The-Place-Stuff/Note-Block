import { Client, Collection, GuildMember, Role } from "discord.js";
import { channels } from "../config.json";
import { TTS } from "./tts";

export class TTSProcessor {
    public static queue: Collection<string, TTS> = new Collection()
    private client: Client

    constructor(client: Client) {
        this.client = client

        this.messageListener()
        this.ttsListener()
    }

    private messageListener() {
        this.client.on("messageCreate", async msg => {
            if (!channels.includes(msg.channelId)) return

            if (msg.author.bot) return

            if (msg.content.startsWith("silent")) return

            console.log("revieved message")

            //Get User Roles
            const user: GuildMember = msg.member as GuildMember
            const userRoles: Collection<string, Role> = user.roles.cache

            //Get Voice Role
            const voiceRole: Role = userRoles.find(r => r.name.endsWith("NOTEBLOCK")) as Role

            if (!voiceRole) return

            const voiceName: string = voiceRole.name.split("NOTEBLOCK")[0].trimEnd()

            //Send data to TTS API
            const tts: TTS = new TTS(voiceName)

            TTSProcessor.queue.set(msg.content, tts)
        })
    }

    private async ttsListener() {
        if (TTS.isPlaying) return

        const tts: TTS = TTSProcessor.queue.first() as TTS

        if (!tts) {
            setTimeout(() => this.ttsListener(), 1000)
            return
        }

        const ttsContent: string = TTSProcessor.queue.firstKey() as string

        tts.speak(ttsContent)

        setTimeout(() => this.ttsListener(), 1000)
    }
}