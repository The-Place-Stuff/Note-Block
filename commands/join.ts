import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Client, GuildMember, ChatInputCommandInteraction } from "discord.js";
import { SlashCommand } from "../types/basic";
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  getVoiceConnection,
  VoiceConnectionStatus,
  entersState,
  DiscordGatewayAdapterCreator,
  VoiceConnection
} from "@discordjs/voice";

export default class JoinCommand implements SlashCommand {
    public data = new SlashCommandBuilder()
        .setName("join")
        .setDescription("NOTEY POO LOVES U")

    public async execute(interaction: ChatInputCommandInteraction, client: Client) {
      const guildUser: GuildMember = await interaction.guild?.members.fetch(interaction.user.id) as GuildMember

      //#region Pre Command Errors
      if (!guildUser.voice.channel) {
        await interaction.reply("You must be in a voice channel to use this command!")
        return
      }
      //#endregion
      
      joinVoiceChannel({
        channelId: guildUser.voice.channel.id,
        guildId: guildUser.guild.id,
        adapterCreator: guildUser.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator
      })

      await interaction.reply({
        content: `Joined <#${guildUser.voice.channel.id}>!`,
        ephemeral: true
      })

    }
}