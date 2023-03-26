import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, entersState, getVoiceConnection, NoSubscriberBehavior, VoiceConnection } from '@discordjs/voice'
import { dirname, join } from 'path'
import voices from './voices.json'
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
    voiceType: string
    volume: number
  }

  constructor(voice: string, voiceType: string) {
    this.ttsData = {
      speed: 1,
      pitch: 1,
      voice: voice,
      voiceType: voiceType,
      volume: 1,
    }
  }

  public async speak(text: string) {
    console.log('Speak ' + text)

    TTS.isPlaying = true

    // Play the audio file via discord.js
    const connection: VoiceConnection = getVoiceConnection('741121896149549160') as VoiceConnection

    if (!connection) {
      TTS.isPlaying = false
      return
    }
    
    await exportAudio(text, this.processVoice(), this.ttsData.voiceType)

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

  // Takes in the voice alias and returns the correct voice
  private processVoice() {
    const voiceMap = new Map<string, string>()
    for (const voice of voices) {
      voiceMap.set(voice.alias, voice.id)
    }

    if (voiceMap.has(this.ttsData.voice)) {
      return voiceMap.get(this.ttsData.voice)
    }

    // Just in case ANYTHING fails, we use outer voice
    this.ttsData.voiceType = "default"
    return "Microsoft David Desktop"
  }
}
