import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, entersState, getVoiceConnection, NoSubscriberBehavior, VoiceConnection } from '@discordjs/voice'
import { dirname, join } from 'path'
import { Client } from 'discord.js'
const exportAudio = require('./exporter.js')

export class TTS {
  public static isPlaying: boolean = false
  private static audioPlayer: AudioPlayer = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause
    }
  })

  private ttsData: {
    speed: number
    pitch: number
    voice: string
    volume: number
  }

  constructor(voice: string) {
    this.ttsData = {
      speed: 1,
      pitch: 1,
      voice: voice,
      volume: 1,
    }
  }

  public async speak(text: string, client: Client) {
    console.log('Speak ' + text)

    TTS.isPlaying = true

    // Play the audio file via discord.js
    //@ts-ignore
    const connection: VoiceConnection = getVoiceConnection('741121896149549160')

    if (!connection) {
      TTS.isPlaying = false
      return
    }

    await exportAudio(text, this.ttsData.voice)

    //@ts-ignore
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
  }
}
