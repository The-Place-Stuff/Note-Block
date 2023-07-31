import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, ChatInputCommandInteraction, APIApplicationCommandOptionChoice } from "discord.js";
import { SlashCommand, VoiceCategory } from "../types/basic";
import { readdirSync, readFileSync } from 'fs'
import { Data } from "../data/utils/DataUtils";
import path from 'path'
import { VoiceUtils } from "../data/utils/VoiceUtils";


export default class VoiceCommand implements SlashCommand {

    public data: SlashCommandBuilder = this.buildVoiceCommand()

    //
    // Builds the voice command
    //
    private buildVoiceCommand(): SlashCommandBuilder {
        const cmd = new SlashCommandBuilder()
        cmd.setName('voice')
        cmd.setDescription('Sets your voice used in text-to-speech.')

        return this.buildSubCommands(cmd);
    }

    //
    // Builds subcommands from the category folder
    //
    private buildSubCommands(cmd: SlashCommandBuilder): SlashCommandBuilder {
        const categories = readdirSync(path.join(__dirname, '../data/assets/category'), 'utf-8')

        // Creates a subcommand based off a JSON defined category
        for (const category of categories) {
            const data: VoiceCategory = JSON.parse(readFileSync(path.join(__dirname, `../data/assets/category/${category}`), 'utf-8'))
            const choices = this.getOptions(data.voices)

            cmd.addSubcommand(subCmd => {
                subCmd.setName(data.name)
                subCmd.setDescription(data.description)

                subCmd.addStringOption(option => {
                    option.setName('voice')
                    option.setDescription('New voice')
                    option.addChoices(...choices)
                    option.setRequired(true)

                    return option
                })
                return subCmd
            })
        }

        // Creates set subcommand
        cmd.addSubcommand(subCmd => {
            subCmd.setName('set')
            subCmd.setDescription('Sets your voice based on voice ID.')
            subCmd.addStringOption(option => {
                option.setName('voice')
                option.setDescription('Voice ID')
                option.setRequired(true)
                return option
            })
            return subCmd
        })

        // Creates clear subcommand
        cmd.addSubcommand(subCmd => {
            subCmd.setName('clear')
            subCmd.setDescription('Clears your current voice.')
            return subCmd
        })

        // Creates get subcommand
        cmd.addSubcommand(subCmd => {
            subCmd.setName('get')
            subCmd.setDescription('Gets the voice name and ID of a user.')
            subCmd.addUserOption(option => {
                option.setName('user')
                option.setDescription('The user to check')
                option.setRequired(true)
                return option
            })
            return subCmd
        })

        // Creates copy subcommand
        cmd.addSubcommand(subCmd => {
            subCmd.setName('copy')
            subCmd.setDescription('Sets your voice to the voice of another user.')
            subCmd.addUserOption(option => {
                option.setName('user')
                option.setDescription('The user to copy')
                option.setRequired(true)
                return option
            })
            return subCmd
        })
        return cmd
    }

    //
    // Creates a list of options for the subcommand builder
    //
    private getOptions(voices: string[]) {
        const options: APIApplicationCommandOptionChoice<string>[] = []
        VoiceUtils.buildVoices()
        voices.forEach(id => {
            const voice = VoiceUtils.getVoice(id)
            options.push({ name: voice.name, value: id })
        })
        return options
    }

    //
    // Command execution
    //
    public async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const subCommand = interaction.options.getSubcommand(true)
        const user = interaction.user
        const userData = Data.getOrCreateUser(user.id, client)

        if (subCommand == 'clear') {
            userData.voice = 'none'
            Data.updateUserData(userData, client)

            return interaction.reply({
                content: 'Your voice has been cleared.',
                ephemeral: true
            })
        }

        if (subCommand == 'get' || subCommand == 'copy') {
            const getUser = interaction.options.getUser('user', true)
            const getData = Data.getOrCreateUser(getUser.id, client)
            const getVoice: string = getData.voice
            let content: string
            if (getVoice == 'none') {
                content = `<@${getUser.id}> has no assigned voice.`
            } else {
                if (subCommand == 'get') {
                    const getVoiceName = VoiceUtils.getVoice(getVoice).name
                    if (getUser == user) {
                        content = `Your voice is set to **${getVoiceName}** (\`${getVoice}\`).`
                    } else {
                        content = `<@${getUser.id}> set their voice to **${getVoiceName}** (\`${getVoice}\`).`
                    }
                } else if (subCommand == 'copy') {
                    userData.voice = getVoice
                    Data.updateUserData(userData, client)

                    content = `Your voice has been set to **${VoiceUtils.getVoice(getVoice).name}**!`
                }
            }
            return interaction.reply({
                content: content!,
                ephemeral: true
            })
        }

        const selectedVoice = interaction.options.getString('voice', true)
        if (subCommand == 'set' && !VoiceUtils.voiceMap.get(selectedVoice)) return interaction.reply({
            content: `\`${selectedVoice}\` is not a valid voice!`,
            ephemeral: true
        })
        userData.voice = selectedVoice
        Data.updateUserData(userData, client)

        return interaction.reply({
            content: `Your voice has been set to **${VoiceUtils.getVoice(selectedVoice).name}**!`,
            ephemeral: true
        })
    }
}