import { Client, Collection, GuildMember, Role } from 'discord.js'
import { channels } from '../config.json'
import { TTS } from './tts'
import { TextOverrides } from './textOverrides'

export class TTSProcessor {
  public static queue: Collection<string, TTS> = new Collection()
  private client: Client

  constructor(client: Client) {
    this.client = client

    this.messageListener()
    this.ttsListener()
  }

  private messageListener() {
    this.client.on('messageCreate', async msg => {
      if (!channels.includes(msg.channelId)) return

      if (msg.author.bot) return
      
      if (msg.content.startsWith('silent')) return

      //Get User Roles
      const user: GuildMember = msg.member as GuildMember
      const userRoles: Collection<string, Role> = user.roles.cache

      //Get Voice Role
      const voiceRole: Role = userRoles.find(r =>
        r.name.endsWith('NOTEBLOCK')
      ) as Role

      if (!voiceRole) return

      const voiceName: string = voiceRole.name.split('NOTEBLOCK')[0].trimEnd()

      //Apply overrides and RegEx filters
      const overrides = new TextOverrides()
      let msgText = msg.content.toLowerCase()

      msgText = overrides.applyFilters(msgText)
      msgText = overrides.applyOverrides(msgText)

      //Send data to TTS API
      const tts: TTS = new TTS(voiceName)

      TTSProcessor.queue.set(msgText, tts)
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

    const ttsContent: string = TTSProcessor.queue.firstKey() as string

    tts.speak(ttsContent, this.client)

    TTSProcessor.queue.delete(TTSProcessor.queue.firstKey()!)

    setTimeout(() => this.ttsListener(), 1)
  }
}
