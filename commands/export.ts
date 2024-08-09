import { SlashCommandBuilder } from '@discordjs/builders'
import { Client, ChatInputCommandInteraction } from 'discord.js'
import { SlashCommand, User, Voice } from '../types/basic'
import { Data } from "../data/utils/DataUtils"
import { VoiceUtils } from '../data/utils/VoiceUtils'
import { audioServices } from '..'
import ExporterUtils from '../data/utils/ExporterUtils'
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

        interaction.deferReply({
            ephemeral: true
        })

        try {
            const service = audioServices.get(voice.service)
            if (service) {
                await service.export(text, voice.id, 'export.wav')
            }
            else {
                throw Error(`Service '${service}' doesn't exist LOL!`)
            }
        }
        catch (error) {
            await interaction.editReply({ content: `Error: ${error}` })
            return
        }
        try {
            await interaction.editReply({
                content: 'The text-to-speech file was exported successfully!',
                files: [
                    {
                        attachment: fs.readFileSync(ExporterUtils.getExportDirectory('export.wav')),
                        name: 'export.wav'
                    }
                ]
            })
        } catch (error) {
            console.error('The application did not respond')
        }
    }
}