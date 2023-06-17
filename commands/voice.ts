import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, ChatInputCommandInteraction, APIApplicationCommandOptionChoice} from "discord.js";
import { SlashCommand, VoiceOption, VoiceCategory, User } from "../types/basic";
import { readdirSync, readFileSync } from 'fs'
import { Data } from "../data/utils/DataUtils";
import path from 'path'


export default class VoiceCommand implements SlashCommand {

    public data: SlashCommandBuilder = this.buildVoiceCommand()

    //
    // Builds the voice command
    //
    private buildVoiceCommand(): SlashCommandBuilder {
        const cmd = new SlashCommandBuilder()
        .setName('voice')
        .setDescription('Pick a voice, any voice!')

        return this.buildSubCommands(cmd);
    }

    //
    // Builds subcommands from the category folder
    //
    private buildSubCommands(cmd: SlashCommandBuilder): SlashCommandBuilder {
        const categories = readdirSync(path.join(__dirname, '../data/assets/category'), 'utf-8')

        for (const category of categories) {
            const data: VoiceCategory = JSON.parse(readFileSync(path.join(__dirname, `../data/assets/category/${category}`), 'utf-8'))
            const choices = this.getOptions(data.voices)

            cmd.addSubcommand(sub => {
                return sub.setName(data.name).setDescription(data.description).addStringOption(option => {
                    return option.setName('voice').setDescription('Choose a voice').addChoices(...choices).setRequired(true)
                })
            })
        }
        cmd.addSubcommand(subCommand => {
            return subCommand.setName("clear")
            .setDescription("Clears voice")
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
        const selectedVoice = interaction.options.getString('voice', true)
        const user = interaction.user
        
        const userData = Data.getOrCreateUser(user.id, client)

        userData.voice = selectedVoice
        Data.updateUserData(userData, client)

        return interaction.reply({
            content: `Your voice has been set to ${selectedVoice}!`,
            ephemeral: true
        })
    }
}