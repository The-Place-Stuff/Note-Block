import { SlashCommandBuilder, ChatInputCommandInteraction, Client, GuildMember } from "discord.js";
import { SlashCommand } from "../types/basic";
import { Data } from "../data/utils/DataUtils";
import { VoiceUtils } from "../data/utils/VoiceUtils";

export default class AdminCommand implements SlashCommand {

    public data: SlashCommandBuilder = this.buildVoiceCommand()

    private buildVoiceCommand() {
        const command = new SlashCommandBuilder()
        
        command.setName('admin')
        command.setDescription('Requires Noteblock Admin role to use')
        command.addSubcommandGroup(group => {
            group.setName('voice')
            group.setDescription('Manage user voices')
            group.addSubcommand(subCmd => {
                subCmd.setName('set')
                subCmd.setDescription('Set a user\'s voice')
                
                subCmd.addUserOption(option => {
                    option.setName('user')
                    option.setDescription('The user to target')
                    option.setRequired(true)
                    return option
                })
                subCmd.addStringOption(option => {
                    option.setName('voice')
                    option.setDescription('Choose a voice')
                    option.setRequired(true)
                    return option
                })
                return subCmd
            })
            group.addSubcommand(subCmd => {
                subCmd.setName('clear')
                subCmd.setDescription('Clear a user\'s voice')
                
                subCmd.addUserOption(option => {
                    option.setName('user')
                    option.setDescription('The user to target')
                    option.setRequired(true)
                    return option
                })                
                return subCmd
            })
            group.addSubcommand(subCmd => {
                subCmd.setName('build')
                subCmd.setDescription('Rebuilds voices')
                return subCmd
            })
            return group
        })
        return command
    }
    
    public async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const member = await interaction.guild?.members.fetch({
            user: interaction.user
        }) as GuildMember
        const highestRole = member.roles.highest

        const subGroup = interaction.options.getSubcommandGroup()
        const subCmd = interaction.options.getSubcommand()

        if (highestRole.name != "Noteblock Admin") {
            return interaction.reply({
                content: "Insufficient permissions to run this command!",
                ephemeral: true
            })
        }
        if (subGroup == 'voice') {
            if (subCmd == 'set') {
                return this.voiceSet(interaction, client)
            }
            if (subCmd == 'voice') {
                return this.voiceClear(interaction, client)
            }
            if (subCmd == 'build') {
                return this.voiceBuild(interaction, client)
            }
        }
        return interaction.reply({
            content: "under construction",
            ephemeral: true
        })
    }

    //
    // Group: voice, Command: set
    //
    private async voiceSet(interaction: ChatInputCommandInteraction, client: Client) {
        const user = interaction.options.getUser('user', true)
        const voice = interaction.options.getString('voice', true)
        const userData = Data.getOrCreateUser(user.id, client)

        if (!VoiceUtils.voiceMap.get(voice)) {
            return interaction.reply({
                content: `${voice} isn't a valid voice!`,
                ephemeral: true
            })
        }
        userData.voice = voice
        Data.updateUserData(userData, client)

        return interaction.reply({
            content: `Set voice of ${user} to ${voice}!`,
            ephemeral: true
        })
    }
    
    //
    // Group: voice, Command: clear
    //
    private async voiceClear(interaction: ChatInputCommandInteraction, client: Client) {
        const user = interaction.options.getUser('user', true)
        const userData = Data.getUserData(user.id)

        if (!userData) return interaction.reply({
            content: 'That user doesn\'t exist in Noteblock\'s database',
            ephemeral: true
        })
        userData.voice = 'none'
        Data.updateUserData(userData, client)

        return interaction.reply({
            content: `Cleared voice of ${user.username}!`,
            ephemeral: true
        })
    }

    //
    // Group: voice, Command: build
    //
    private async voiceBuild(interaction: ChatInputCommandInteraction, client: Client) {
        VoiceUtils.voiceMap.clear()
        VoiceUtils.buildVoices()

        return interaction.reply({
            content: `Successfully rebuilt voices!`,
            ephemeral: true
        })
    }

    private async addOverride() {
        
    }

    private async removeOverride() {
        
    }
}