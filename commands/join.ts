import { SlashCommandBuilder } from '@discordjs/builders'
import { Client, GuildMember, ChatInputCommandInteraction } from 'discord.js'
import { SlashCommand } from '../types/basic'
import { joinVoiceChannel, DiscordGatewayAdapterCreator } from '@discordjs/voice'
import { CommandReplyer } from '../data/commandReplyer'

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
        embeds: [
            {
                title: 'Join',
                description: CommandReplyer.getReply(interaction.user.id, 'join'),
                thumbnail: {
                    url: 'https://images-ext-2.discordapp.net/external/82cdlfs7VXGWRAznTIOpL16NR6NCU9fyOFHX2Cf9AG4/%3Fsize%3D1024/https/cdn.discordapp.com/avatars/1081717850722553906/e2704cd816d628b43e8b999c4afd2a88.png?width=671&height=671'
                }
            }
        ]
    })
  }
}
