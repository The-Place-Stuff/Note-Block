import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, entersState, getVoiceConnection, NoSubscriberBehavior, VoiceConnection } from '@discordjs/voice';
import { export as sayExport } from 'say';
import { join } from 'path'

const ffmpeg = require('ffmpeg-static');
const exportAudio = require('./exporter.js')

export class TTS {
    public static isPlaying: boolean = false;

    private ttsData: {
        speed: number;
        pitch: number;
        voice: string;
        volume: number;
    }

    constructor(voice: string) {
        this.ttsData = {
            speed: 1,
            pitch: 1,
            voice: voice,
            volume: 1.25
        }
    }

    public async speak(text: string) {
        TTS.isPlaying = true

        exportAudio(text)

        // Play the audio file via discord.js
        const connection: VoiceConnection = await getVoiceConnection("741121896149549160") as VoiceConnection

        const audioFile: AudioResource = createAudioResource("tts.wav", {
            inlineVolume: true
        })
        audioFile.volume?.setVolume(this.ttsData.volume)

        const audioPlayer: AudioPlayer = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause
            }
        })

        audioPlayer.play(audioFile)

        connection.subscribe(audioPlayer)

        // @ts-ignore
        await entersState(audioPlayer, AudioPlayerStatus.Playing)

        // @ts-ignore
        await entersState(audioPlayer, AudioPlayerStatus.Idle)

        TTS.isPlaying = false
    }
}