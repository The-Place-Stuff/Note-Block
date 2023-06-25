import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, ChatInputCommandInteraction, APIApplicationCommandOptionChoice} from "discord.js";
import { SlashCommand, VoiceOption, VoiceCategory, User } from "../types/basic";
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
        cmd.setDescription('Pick a voice, any voice!')
        
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
                    option.setDescription('Choose a voice')
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
            subCmd.setDescription('Set a voice manually')
            subCmd.addStringOption(option => {
                option.setName('voice')
                option.setDescription('Choose a voice')
                option.setRequired(true)
                return option
            })
            return subCmd
        })

        // Creates clear subcommand
        cmd.addSubcommand(subCmd => {
            subCmd.setName('clear')
            subCmd.setDescription('Clears your voice')
            return subCmd
        })
        return cmd
    }

    //
    // Creates a list of options for the subcommand builder
    //
    private getOptions(voiceOptions: VoiceOption[]) {
        const options: APIApplicationCommandOptionChoice<string>[] = []
        voiceOptions.forEach(option => {
            options.push({name: option.display, value: option.name})
        })
        return options
    }

    //
    // Command execution
    //
    public async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const subCommand = interaction.options.getSubcommand(true)
        const selectedVoice = interaction.options.getString('voice', true)
        const user = interaction.user
        
        const userData = Data.getOrCreateUser(user.id, client)

        if (subCommand == 'set' && !VoiceUtils.voiceMap.get(selectedVoice)) return interaction.reply({
            content: `${selectedVoice} isn't a valid voice!`,
            ephemeral: true
        })

        userData.voice = subCommand != 'clear' ? selectedVoice : 'none'
        Data.updateUserData(userData, client)

        return interaction.reply({
            content: `Your voice has been set to ${selectedVoice}!`,
            ephemeral: true
        })
    }
}