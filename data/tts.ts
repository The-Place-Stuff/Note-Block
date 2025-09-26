import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, entersState, getVoiceConnection, NoSubscriberBehavior, VoiceConnection } from '@discordjs/voice'
import { dirname, join } from 'path'
import { FileGeneratingStatus, Voice } from '../types/basic'
import { audioServices } from '..'
import { unlinkSync, existsSync } from 'fs'

export class TTS {
    public static isPlaying: boolean = false
    public static audioPlayer: AudioPlayer = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause
        }
    })

    public fileGenerating: FileGeneratingStatus = "generating" 

    public ttsData: {
        speed: number
        pitch: number
        voice: Voice
        volume: number,
        uuid: string
    }

    constructor(voice: Voice, uuid: string) {
        this.ttsData = {
            speed: 1,
            pitch: 1,
            voice: voice,
            volume: 1,
            uuid: uuid
        }
    }

    public async generateAudioFile(text: string) {
        try {
            const serviceId = this.ttsData.voice.service
            const service = audioServices.get(serviceId)
            if (service) {
                console.log("Generating audio..")
                await service.export(text, this.ttsData.voice.id, serviceId != "MICROSOFT" ? `/data/queue/${this.ttsData.uuid}.wav` : join(dirname(__dirname), `/data/queue/${this.ttsData.uuid}.wav`))
                console.log(`Exporting finished! Generated file for: ${text}`)
                this.fileGenerating = 'ready'
            }
            else throw Error(`Service '${serviceId}' does not exist.`)
        }
        catch (error) {
            console.warn(`Error produced by '${text}': ${error}`)
            this.fileGenerating = 'error'
            return
        }
    }

    public async speak() {
        if (this.fileGenerating == 'error') {
            TTS.isPlaying = false
            return
        }

        TTS.isPlaying = true

        if (this.fileGenerating == 'generating') {
            setTimeout(() => this.speak(), 1)
            return
        }

        console.log('ready')

        // Play the audio file via discord.js
        const connection: VoiceConnection = getVoiceConnection('741121896149549160') as VoiceConnection

        if (!connection) {
            TTS.isPlaying = false
            return
        }

        const audioPlayer: AudioPlayer = TTS.audioPlayer

        const audioFile: AudioResource = createAudioResource(
            join(dirname(__dirname), `/data/queue/${this.ttsData.uuid}.wav`),
            {
                inlineVolume: true,
            }
        )
        audioFile.volume?.setVolume(this.ttsData.volume)
        audioPlayer.play(audioFile)
        connection.subscribe(audioPlayer)

        // @ts-ignore
        await entersState(audioPlayer, AudioPlayerStatus.Playing)

        // @ts-ignore
        await entersState(audioPlayer, AudioPlayerStatus.Idle)

        TTS.isPlaying = false

        unlinkSync(join(dirname(__dirname), `/data/queue/${this.ttsData.uuid}.wav`))
    }
}
