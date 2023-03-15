import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, entersState, getVoiceConnection, NoSubscriberBehavior, VoiceConnection } from '@discordjs/voice'
import { dirname, join } from 'path'
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
    isTikTok: boolean
    volume: number
  }

  constructor(voice: string, isTikTok: boolean) {
    this.ttsData = {
      speed: 1,
      pitch: 1,
      voice: voice,
      isTikTok: isTikTok,
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
    
    await exportAudio(text, this.processVoice(), this.ttsData.isTikTok)

    const audioPlayer: AudioPlayer = TTS.audioPlayer as AudioPlayer

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
    voiceMap.set("outer", "Microsoft David Desktop")
    voiceMap.set("chiko", "Microsoft Zira Desktop")
    voiceMap.set("narrator_tt", "en_male_narration")
    voiceMap.set("pirate_tt", "en_male_pirate")
    voiceMap.set("wacky_tt", "en_male_funny")
    voiceMap.set("peaceful_tt", "en_female_emotional")
    voiceMap.set("stormtrooper_tt", "en_us_stormtrooper")
    voiceMap.set("singing_chipmunk_tt", "en_male_m2_xhxs_m03_silly")

    if (voiceMap.has(this.ttsData.voice)) {
      return voiceMap.get(this.ttsData.voice)
    }

    // Just in case ANYTHING fails, we use outer voice
    this.ttsData.isTikTok = false
    return "Microsoft David Desktop"
  }
}
