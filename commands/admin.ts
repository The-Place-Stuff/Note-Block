import { SlashCommandBuilder, ChatInputCommandInteraction, Client, GuildMember } from "discord.js";
import { SlashCommand } from "../types/basic";
import { Data } from "../data/utils/DataUtils";

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

        if (subGroup == 'voice' && subCmd == 'clear') {
            return this.voiceClear(interaction, client)
        }
        return interaction.reply({
            content: "under construction",
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

    private async addOverride() {

    }

    private async removeOverride() {
        
    }
}