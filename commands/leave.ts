import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, ChatInputCommandInteraction } from "discord.js";
import { SlashCommand } from "../types/basic";
import { getVoiceConnection, VoiceConnection } from "@discordjs/voice";

export default class LeaveCommand implements SlashCommand {
    data: SlashCommandBuilder = new SlashCommandBuilder()
        .setName("leave")
        .setDescription("Leaves the voice channel Note Block is currently in.")
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const connection: VoiceConnection = getVoiceConnection(interaction.guild?.id as string) as VoiceConnection

        //#region Pre Command Errors
        if (!connection) {
            await interaction.reply({
                content: "Note Block is not in a voice channel.",
                ephemeral: true
            })
            return
        }
        //#endregion

        // Disconnect from the voice channel
        connection.destroy()

        await interaction.reply({
            content: "Note Block left the voice channel!",
            ephemeral: false
        })
    }
}