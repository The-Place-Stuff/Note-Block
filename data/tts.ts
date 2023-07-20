import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, entersState, getVoiceConnection, NoSubscriberBehavior, VoiceConnection } from '@discordjs/voice'
import { dirname, join } from 'path'
import { QueueMessageData, Voice } from '../types/basic'
import { unlinkSync } from 'fs'
import { TTSProcessor } from './ttsProcessor'
const exportAudio = require('./exporter.js')

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

  public async speak(fileID: string) {
    TTS.isPlaying = true

    // Play the audio file via discord.js
    const connection: VoiceConnection = getVoiceConnection('741121896149549160') as VoiceConnection

    if (!connection) {
      TTS.isPlaying = false
      return
    }

    const audioPlayer: AudioPlayer = TTS.audioPlayer

    const audioFile: AudioResource = createAudioResource(
      join(dirname(__dirname), `/data/audios/queue/${fileID}.wav`),
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

    unlinkSync(join(dirname(__dirname), `/data/audios/queue/${fileID}.wav`) as string)
    TTSProcessor.queue.delete(TTSProcessor.queue.firstKey() as QueueMessageData)
    TTS.isPlaying = false
  }

  public async createAudio(text: string, fileID: string) {
    await exportAudio(text, this.ttsData.voice.id, this.ttsData.voice.service, join(dirname(__dirname), `/data/audios/queue/${fileID}.wav`) as string)
  }
}
