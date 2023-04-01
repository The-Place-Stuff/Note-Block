import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, ChatInputCommandInteraction } from "discord.js";
import { SlashCommand } from "../types/basic";
import { getVoiceConnection, VoiceConnection } from "@discordjs/voice";
import { CommandReplyer } from "../data/commandReplyer";

export default class LeaveCommand implements SlashCommand {
    data: SlashCommandBuilder = new SlashCommandBuilder()
        .setName("leave")
        .setDescription("Leaves the voice channel Note Block is currently in")
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
            embeds: [
                {
                    title: 'Left!',
                    description: CommandReplyer.getReply(interaction.user.id, 'leave'),
                    thumbnail: {
                        url: 'https://images-ext-2.discordapp.net/external/82cdlfs7VXGWRAznTIOpL16NR6NCU9fyOFHX2Cf9AG4/%3Fsize%3D1024/https/cdn.discordapp.com/avatars/1081717850722553906/e2704cd816d628b43e8b999c4afd2a88.png?width=671&height=671'
                    }
                }
            ]
        })
    }
}