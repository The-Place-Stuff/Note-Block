import { Client, Collection, Message, TextChannel } from 'discord.js'
import { channels } from '../config.json'
import { TTS } from './tts'
import { TextOverrides } from './textOverrides'
import { QueueMessageData, Voice, User } from '../types/basic'
import { Data } from './utils/DataUtils'
import { VoiceUtils } from './utils/VoiceUtils'

export class TTSProcessor {
  public static queue: Collection<QueueMessageData, TTS> = new Collection()
  private client: Client

  constructor(client: Client) {
    this.client = client

    this.client.on('messageCreate', this.messageListener)
    this.ttsListener()
  }

  private async messageListener(msg: Message) {
    if (!channels.includes(msg.channelId)) return
    if (msg.content.startsWith("\\ ")) return
    if (msg.content == '' && msg.channel.id !== "1095055405354336286") return
    console.log("Message Received")

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

    TTSProcessor.queue.set({
      messageID: msg.id,
      channel: msg.channel as TextChannel,
      isMinecraft: msg.author.id === "1095051988636549241"
    }, tts)
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

    //Get Message Data & Fetch Message Content
    const ttsMessageData: QueueMessageData = TTSProcessor.queue.firstKey() as QueueMessageData

    let ttsContent: string

    //If message is deleted, remove from queue
    try {
      if (!ttsMessageData.isMinecraft) ttsContent = (await ttsMessageData.channel.messages.fetch(ttsMessageData.messageID)).content
      
      else ttsContent = (await ttsMessageData.channel.messages.fetch(ttsMessageData.messageID)).embeds[0].title as string

    } catch (error) {
      TTSProcessor.queue.delete(TTSProcessor.queue.firstKey() as QueueMessageData)

      setTimeout(() => this.ttsListener(), 1)
      return
    }

    // Say it & Apply Before TTS Filters
    tts.speak(this.beforeTTS(ttsContent))

    TTSProcessor.queue.delete(TTSProcessor.queue.firstKey() as QueueMessageData)

    setTimeout(() => this.ttsListener(), 1)
  }

  //Add filters here
  private beforeTTS(ttsMessage: string) {
      //Apply overrides and RegEx filters
      let msgText: string = ttsMessage.toLowerCase()

      msgText = TextOverrides.filter(msgText, this.client)

      return msgText
  }
}
