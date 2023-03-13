import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Client, GuildMember, ChatInputCommandInteraction } from "discord.js";
import { SlashCommand } from "../types/basic";
import {
    entersState,
  getVoiceConnection, 
  VoiceConnection, 
  VoiceConnectionStatus
} from "@discordjs/voice";

export default class LeaveCommand implements SlashCommand {
    data: SlashCommandBuilder = new SlashCommandBuilder()
        .setName("leave")
        .setDescription("NOTEY POO HATES U")
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const connection: VoiceConnection = getVoiceConnection(interaction.guild?.id as string) as VoiceConnection

        //#region Pre Command Errors
        if (!connection) {
            await interaction.reply({
                content: "I'm not in a voice channel!",
                ephemeral: true
            })
            return
        }
        //#endregion

        // Disconnect from the voice channel
        connection.destroy()

        await interaction.reply({
            content: "Left the voice channel!",
            ephemeral: true
        })
    }
}