import { SlashCommandBuilder } from '@discordjs/builders'
import { Client, ChatInputCommandInteraction } from 'discord.js'
import { SlashCommand, User, Voice } from '../types/basic'
import { Data } from "../data/utils/DataUtils"
import { VoiceUtils } from '../data/utils/VoiceUtils'
const exportAudio = require('../data/exporter.js')
const fs = require('fs')

export default class ExportCommand implements SlashCommand {
    public data = new SlashCommandBuilder()
        .setName('export')
        .setDescription("Exports a text-to-speech audio file.")
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('Text-to-speech message')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('voice')
                .setDescription('Voice ID')
                .setRequired(false)
        ) as SlashCommandBuilder

    public async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const text: string = interaction.options.getString('message', true)
        const userData: User = Data.getOrCreateUser(interaction.user.id, client)
        const id: string = interaction.options.getString('voice', false) ?? userData.voice
        const voice: Voice = VoiceUtils.getVoice(id)

        if (voice == null) {
            return interaction.reply({
                content: `\`${id}\` is not a valid voice!`,
                ephemeral: true
            })
        }

        await exportAudio(text, voice.id, voice.service, 'export.wav')

        try {
            await interaction.reply({
                content: `The text-to-speech file was exported successfully!`,
                ephemeral: true,
                files: [
                    {
                        attachment: fs.readFileSync('./export.wav'),
                        name: 'export.wav'
                    }
                ]
            })
        } catch (error) {
            console.error('The application did not respond')
        }
    }
}