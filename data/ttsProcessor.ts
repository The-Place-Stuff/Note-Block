import { Client, Collection, GuildMember, Message, Role, TextChannel } from 'discord.js'
import { channels } from '../config.json'
import { TTS } from './tts'
import { TextOverrides } from './textOverrides'
import { QueueMessageData, Voice, User } from '../types/basic'
import { Data } from './utils/DataUtils'

export class TTSProcessor {
  public static voiceMap: Collection<string, Voice> = new Collection()
  public static queue: Collection<QueueMessageData, TTS> = new Collection()
  private client: Client

  constructor(client: Client) {
    this.client = client

    this.messageListener()
    this.ttsListener()
  }

  private messageListener() {
    this.client.on('messageCreate', async msg => {
      if (!channels.includes(msg.channelId)) return
      
      if (msg.content.startsWith("\\ ")) return

      if (msg.content == '' && msg.channel.id !== "1095055405354336286") return

      let userData: User = Data.getUserData(msg.author.id) as User

      console.log("Message Received")

      // Minecraft Server Stuff
      if (msg.author.id === "1095051988636549241") {

        console.log("Minecraft Message")

        for (const register of Data.dataFile) {
          
          if (!register.minecraft_name) continue

          console.log("Checking " + register.minecraft_name)

          if (msg.embeds[0].author?.name.toLowerCase() == (register.minecraft_name as string).toLowerCase()) {
            userData = Data.getUserData(register.id) as User

            console.log("Found")

            break
          }
        }
      }

      if (!userData || userData.voice == "none") return

      // Get User Voice
      const voice: string = userData.voice
      
      //Send data to TTS API
      const tts: TTS = new TTS(voice)

      TTSProcessor.queue.set({
        messageID: msg.id,
        channel: msg.channel as TextChannel,
        isMinecraft: msg.author.id === "1095051988636549241"
      }, tts)
    })
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
