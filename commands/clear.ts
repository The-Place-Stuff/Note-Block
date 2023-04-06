import { AudioPlayerStatus, entersState } from '@discordjs/voice'
import { SlashCommandBuilder } from '@discordjs/builders'
import { Client, ChatInputCommandInteraction } from 'discord.js'
import { SlashCommand } from '../types/basic'
import { TTS } from '../data/tts'
import { TTSProcessor } from '../data/ttsProcessor'

export default class ClearCommand implements SlashCommand {

  public data = new SlashCommandBuilder()
    .setName('clear')
    .setDescription("Stops Note Block's speech and optionally clears the queue")
    .addBooleanOption(clearQueue =>
      {
          return clearQueue
          .setName('clear')
          .setDescription('Clear the queue (optional)')
          .setRequired(false)
      }
  ) as SlashCommandBuilder

  public async execute(interaction: ChatInputCommandInteraction, client: Client) {
    TTS.audioPlayer.stop(true)

    const clear: boolean = interaction.options.getBoolean('clear', false) as boolean

    if (clear) {
      TTSProcessor.queue.clear()
    }
    
    await interaction.reply({
      content: clear ? "Stopped and cleared queue!" : "Stopped!",
      ephemeral: false,
    })
  }
}
