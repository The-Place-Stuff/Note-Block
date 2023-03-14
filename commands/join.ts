import { SlashCommandBuilder } from '@discordjs/builders'
import { Client, GuildMember, ChatInputCommandInteraction } from 'discord.js'
import { SlashCommand } from '../types/basic'
import { joinVoiceChannel, DiscordGatewayAdapterCreator } from '@discordjs/voice'

export default class JoinCommand implements SlashCommand {

  public data = new SlashCommandBuilder()
    .setName('join')
    .setDescription("Joins the voice channel you're currently in")

  public async execute(interaction: ChatInputCommandInteraction, client: Client) {
    const guildUser: GuildMember = (await interaction.guild?.members.fetch(
      interaction.user.id
    )) as GuildMember

    //#region Pre Command Errors
    if (!guildUser.voice.channel) {
      await interaction.reply(
        'You must be in a voice channel to use this command!'
      )
      return
    }
    //#endregion

    //@ts-ignore
    joinVoiceChannel({
      channelId: guildUser.voice.channel.id,
      guildId: guildUser.guild.id,
      adapterCreator: guildUser.guild
        .voiceAdapterCreator as DiscordGatewayAdapterCreator,
    })

    await interaction.reply({
      content: `Joined <#${guildUser.voice.channel.id}>!`,
      ephemeral: true,
    })
  }
}
