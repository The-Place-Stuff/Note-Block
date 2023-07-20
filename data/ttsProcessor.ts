import { Client, Collection, Message, TextChannel } from 'discord.js'
import { channels } from '../config.json'
import { TTS } from './tts'
import { TextOverrides } from './textOverrides'
import { QueueMessageData, Voice, User } from '../types/basic'
import { Data } from './utils/DataUtils'
import { VoiceUtils } from './utils/VoiceUtils'
import { existsSync } from 'fs'
import { dirname, join } from 'path'

export class TTSProcessor {
  public static queue: Collection<QueueMessageData, TTS> = new Collection()
  private client: Client

  private audioQueue: Message[]

  constructor(client: Client) {
    this.client = client
    this.audioQueue = []

    this.client.on('messageCreate', this.messageListener.bind(this))
    this.ttsListener()
  }

  public async messageListener(msg: Message, recall?: boolean) {
    if (!channels.includes(msg.channelId)) return
    if (msg.content.startsWith("\\ ")) return
    if (msg.content == '' && msg.channel.id !== "1095055405354336286") return

    console.log("Message Received")

    this.audioQueue = this.audioQueue || []

    if (!recall) this.audioQueue.push(msg)  

    if (this.audioQueue.length > 1 && !recall) return

    msg = this.audioQueue[0] as Message

    let user: User | undefined = Data.getUserData(msg.author.id)

    // Minecraft Server Stuff
    if (msg.author.id === "1095051988636549241") {
      user = this.minecraftListener(msg)
    }
    if (!user || user.voice == "none") return

    // Get User Voice
    const voice: Voice = VoiceUtils.getVoice(user.voice)
    
    //Send data to TTS API
    const tts: TTS = new TTS(voice)

    //TTS Message Data
    const ttsMessageData: QueueMessageData = {
      messageID: msg.id,
      channel: msg.channel as TextChannel,
      isMinecraft: msg.author.id === "1095051988636549241"
    }

    let ttsContent: string

    //If message is deleted, remove from queue
    try {
      if (!ttsMessageData.isMinecraft) ttsContent = (await ttsMessageData.channel.messages.fetch(ttsMessageData.messageID)).content.toLowerCase()
      
      else ttsContent = (await ttsMessageData.channel.messages.fetch(ttsMessageData.messageID)).embeds[0].title as string

    } catch (error) {
      TTSProcessor.queue.delete(TTSProcessor.queue.firstKey() as QueueMessageData)

      setTimeout(() => this.ttsListener(), 1)
      return
    }

    ttsContent = await TextOverrides.filter(ttsContent, this.client)

    await tts.createAudio(ttsContent, ttsMessageData.messageID)

    console.log(ttsMessageData.messageID)

    this.audioQueue.shift()

    TTSProcessor.queue.set({
      messageID: msg.id,
      channel: msg.channel as TextChannel,
      isMinecraft: msg.author.id === "1095051988636549241"
    }, tts)

    if (this.audioQueue.length > 0) {
      this.messageListener(this.audioQueue[0], true)
    }
  }

  private minecraftListener(msg: Message): User | undefined {
    console.log('Minecraft message sent.')
    for (const user of Data.dataFile) {
      if (!user.minecraft_name) continue

      console.log(`Checking ${user.minecraft_name}`)

      if (msg.embeds[0].author?.name.toLowerCase() == (user.minecraft_name as string).toLowerCase()) {
        console.log(`Found ${user.minecraft_name}!`)
        return Data.getUserData(user.id) as User
      }
    }
    return undefined
  }

  private async ttsListener() {
    if (TTS.isPlaying) {
      setTimeout(() => this.ttsListener(), 1)
      return
    }

    const tts: TTS = TTSProcessor.queue.first() as TTS

    if (!tts) {
      setTimeout(() => this.ttsListener(), 1)
      return
    }
    
    this.client.channels.cache.get(channels[0])

    //Get Message Data
    const ttsMessageData: QueueMessageData = TTSProcessor.queue.firstKey() as QueueMessageData

    // Say it
    tts.speak(ttsMessageData.messageID)

    setTimeout(() => this.ttsListener(), 1)
  }
}
