import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, entersState, getVoiceConnection, NoSubscriberBehavior, VoiceConnection } from '@discordjs/voice';
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
            volume: 1
        }
    }

    public async speak(text: string) {
        TTS.isPlaying = true

        // Play the audio file via discord.js
        const connection: VoiceConnection = getVoiceConnection("741121896149549160")!
        if (!connection) {
            TTS.isPlaying = false
            return
        }

        exportAudio(text, this.ttsData.voice)

        const audioPlayer: AudioPlayer = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause
            }
        })
        audioPlayer.on("debug", (debug) => {
            console.log(debug)
        })

        const audioFile: AudioResource = createAudioResource('../tts.wav', {
            inlineVolume: true
        })
        audioFile.volume?.setVolume(this.ttsData.volume)

        connection.subscribe(audioPlayer)
        audioPlayer.play(audioFile)

        // @ts-ignore
        await entersState(audioPlayer, AudioPlayerStatus.Playing)

        // @ts-ignore
        await entersState(audioPlayer, AudioPlayerStatus.Idle)

        TTS.isPlaying = false
    }
}