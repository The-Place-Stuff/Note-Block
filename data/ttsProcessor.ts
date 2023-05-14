import { Client, Collection, GuildMember, Message, Role, TextChannel } from 'discord.js'
import { channels } from '../config.json'
import { TTS } from './tts'
import { TextOverrides } from './textOverrides'
import { QueueMessageData, Voice } from '../types/basic'

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

      if (msg.content == '') return

      //Get User Roles
      const user: GuildMember = msg.member as GuildMember
      const userRoles: Collection<string, Role> = user.roles.cache

      //Get Voice Role
      const voiceRole: Role = userRoles.find(r =>
        r.name.endsWith('_nb')
      ) as Role

      if (!voiceRole) return

      const voice: Voice = TTSProcessor.voiceMap.get(voiceRole.name.split('_nb')[0].trimEnd()) as Voice
      
      //Send data to TTS API
      const tts: TTS = new TTS(voice)

      TTSProcessor.queue.set({
        messageID: msg.id,
        channel: msg.channel as TextChannel
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
      ttsContent = (await ttsMessageData.channel.messages.fetch(ttsMessageData.messageID)).content
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
