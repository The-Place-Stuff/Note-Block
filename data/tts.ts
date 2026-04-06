import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, entersState, getVoiceConnection, NoSubscriberBehavior, VoiceConnection, VoiceConnectionStatus } from '@discordjs/voice'
import { dirname, join } from 'path'
import { Voice } from '../types/basic'
import { audioServices } from '..'
import * as IDConstants from '../data/utils/IDConstants'

export class TTS {
    public static isPlaying: boolean = false
    public static audioPlayer: AudioPlayer = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause
        }
    })

    private ttsData: {
        speed: number
        pitch: number
        voice: Voice
        volume: number
    }

    constructor(voice: Voice) {
        this.ttsData = {
            speed: 1,
            pitch: 1,
            voice: voice,
            volume: 1,
        }
    }

    public async speak(text: string, guildId: string) {
        console.log(guildId)
        console.log('Speak ' + text)

        TTS.isPlaying = true

        // Play the audio file via discord.js
        const connection: VoiceConnection = getVoiceConnection(guildId) as VoiceConnection

        if (!connection) {
            console.log("Valid connection not found")
            TTS.isPlaying = false
            return
        }
        try {
            const serviceId = this.ttsData.voice.service
            const service = audioServices.get(serviceId)
            if (service) {
                await service.export(text, this.ttsData.voice.data, 'tts.wav')
                console.log(`Exporting finished! Now playing: ${text}`)
            }
            else throw Error(`Service '${serviceId}' does not exist.`)
        }
        catch (error) {
            if (error instanceof Error) {
                console.warn(`Error produced by '${text}': ${error.stack}`)
            }
            else {
                console.warn(`Error produced by '${text}': ${error}`)
            }

            
            TTS.isPlaying = false
            return
        }
        const audioPlayer: AudioPlayer = TTS.audioPlayer

        const audioFile: AudioResource = createAudioResource(
            join(dirname(__dirname), 'tts.wav'),
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

        console.log("finish")
    }
}
