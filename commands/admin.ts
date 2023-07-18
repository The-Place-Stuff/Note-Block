import { SlashCommandBuilder, ChatInputCommandInteraction, Client, GuildMember } from "discord.js";
import { SlashCommand } from "../types/basic";
import { Data } from "../data/utils/DataUtils";
import { VoiceUtils } from "../data/utils/VoiceUtils";
import { TTS } from "../data/tts";
import { TTSProcessor } from "../data/ttsProcessor";
import { AudioPlayerStatus } from "@discordjs/voice";

export default class AdminCommand implements SlashCommand {

    public data: SlashCommandBuilder = this.buildVoiceCommand()

    private buildVoiceCommand() {
        const command = new SlashCommandBuilder()
        
        command.setName('admin')
        command.setDescription('Runs various admin commands that require the Noteblock Admin role.')
        command.addSubcommandGroup(group => {
            group.setName('voice')
            group.setDescription('Manages users\' voices.')
            group.addSubcommand(subCmd => {
                subCmd.setName('set')
                subCmd.setDescription('Sets a user\'s voice.')
                
                subCmd.addUserOption(option => {
                    option.setName('user')
                    option.setDescription('The user to target')
                    option.setRequired(true)
                    return option
                })
                subCmd.addStringOption(option => {
                    option.setName('voice')
                    option.setDescription('Voice ID')
                    option.setRequired(true)
                    return option
                })
                return subCmd
            })
            group.addSubcommand(subCmd => {
                subCmd.setName('clear')
                subCmd.setDescription('Clears a user\'s voice.')
                
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
                subCmd.setDescription('Rebuilds all voices.')
                return subCmd
            })
            return group
        })
        command.addSubcommandGroup(group => {
            group.setName('queue')
            group.setDescription('Manages the text-to-speech queue.')
            group.addSubcommand(subCmd => {
                subCmd.setName('skip')
                subCmd.setDescription('Skips the current text-to-speech message.')
                return subCmd
            })
            group.addSubcommand(subCmd => {
                subCmd.setName('clear')
                subCmd.setDescription('Clears the entire text-to-speech queue.')
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
                content: "You do not have permission to use admin commands!",
                ephemeral: true
            })
        }
        // Voice group
        if (subGroup == 'voice') {
            if (subCmd == 'set') {
                return this.voiceSet(interaction, client)
            }
            if (subCmd == 'clear') {
                return this.voiceClear(interaction, client)
            }
            if (subCmd == 'build') {
                return this.voiceBuild(interaction, client)
            }
        }
        // Queue group
        if (subGroup == 'queue') {
            if (subCmd == 'skip') {
                return this.queueSkip(interaction, client)
            }
            if (subCmd == 'clear') {
                return this.queueClear(interaction, client)
            }
        }

        return interaction.reply({
            content: "There was an error running the command!",
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
                content: `\`${voice}\` is not a valid voice!`,
                ephemeral: true
            })
        }
        userData.voice = voice
        Data.updateUserData(userData, client)

        return interaction.reply({
            content: `The voice of ${user} has been set to **${VoiceUtils.getVoice(voice).name}**!`,
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
            content: `${user} does not have a selected voice.`,
            ephemeral: true
        })
        userData.voice = 'none'
        Data.updateUserData(userData, client)

        return interaction.reply({
            content: `The voice of ${user} has been cleared.`,
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
            content: 'All voices were successfully rebuilt!',
            ephemeral: true
        })
    }

    //
    // Group: queue, Command: skip
    //
    private async queueSkip(interaction: ChatInputCommandInteraction, client: Client) {
        let content: string
        if (TTS.audioPlayer.state.status == AudioPlayerStatus.Idle) {
            content = 'There is no text-to-speech currently playing.'
        } else {
            content = 'The current text-to-speech message was skipped!'
            TTS.audioPlayer.stop()
        }

        return interaction.reply({
            content: content,
            ephemeral: true
        })
    }

    //
    // Group: queue, Command: clear
    //
    private async queueClear(interaction: ChatInputCommandInteraction, client: Client) {
        let content: string
        if (TTS.audioPlayer.state.status == AudioPlayerStatus.Idle) {
            content = 'There is no text-to-speech currently playing.'
        } else {
            content = 'The text-to-speech queue was cleared!'
            TTS.audioPlayer.stop()
            TTSProcessor.queue.clear()
        }

        return interaction.reply({
            content: content,
            ephemeral: true
        })
    }

    //
    // Group: override, Command: add
    //
    private async addOverride() {
        // WIP
    }

    //
    // Group: override, Command: remove
    //
    private async removeOverride() {
        // WIP
    }
}