import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, ChatInputCommandInteraction, APIApplicationCommandOptionChoice, Guild, Collection, Role, GuildMember, User } from "discord.js";
import { SlashCommand, Voice, VoiceCategory } from "../types/basic";
import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import { TTSProcessor } from "../data/ttsProcessor";

export default class VoiceCommand implements SlashCommand {
    private parsedVoices: Voice[] = []

    // Defines the initial command
    private buildVoiceCommand(): SlashCommandBuilder {
        const cmd = new SlashCommandBuilder()
        .setName('voice')
        .setDescription('Pick a voice, any voice!')

        return this.buildSubCommands(cmd);
    }

    // Builds subcommands from the category folder
    private buildSubCommands(cmd: SlashCommandBuilder): SlashCommandBuilder {
        const categories = readdirSync(path.join(__dirname, '../data/category'), 'utf-8')

        for (const category of categories) {
            const data: VoiceCategory = JSON.parse(readFileSync(path.join(__dirname, `../data/category/${category}`), 'utf-8'))
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

    // Creates a list of options for a subcommand
    private getOptions(voices: Voice[]) {
        const options: APIApplicationCommandOptionChoice<string>[] = []
        voices.forEach(voice => {
            this.parsedVoices.push(voice)
            options.push({name: voice.display, value: voice.alias})
            TTSProcessor.voiceMap.set(voice.alias, voice)
        })
        return options
    }

    public data: SlashCommandBuilder = this.buildVoiceCommand()

    public async execute(interaction: ChatInputCommandInteraction, client: Client) {
        // User Data
        const userGuild: Guild = interaction.guild as Guild
        const guildRoles: Collection<string, Role> = await userGuild.roles.fetch()
        const user: GuildMember = await userGuild.members.fetch(interaction.user.id)

        // Remove the old voice role
        const userRoles: Collection<string, Role> = user.roles.cache

        const currentVoiceRole: Role = userRoles.find(r => r.name.endsWith("_nb")) as Role

        if (currentVoiceRole) {
            let roleMemberCount: number = currentVoiceRole.members.size

            await user.roles.remove(currentVoiceRole)

            roleMemberCount--

            //Check if the role has no members, then delete it

            const roleToDelete: Role = guildRoles.find(r => r.name === currentVoiceRole.name) as Role

            if (roleMemberCount === 0) {
                await roleToDelete.delete()
            }
        }

        // Sudden return when running the clear subcommand
        if (interaction.options.getSubcommand(true) == 'clear') {
            await interaction.reply({
                content: `Removed voice!`,
                ephemeral: true
            })
            return
        }

        const voice: string = interaction.options.getString("voice") as string

        // Check if the voice is valid
        if (!this.parsedVoices.find(v => v.alias === voice)) {
            await interaction.reply({
                content: "That voice is not valid!",
                ephemeral: true
            })
            return
        }
        const voiceData = this.parsedVoices.find(v => v.alias === voice) as Voice

        // If the user already has the voice
        if (user.roles.cache.find(role => role.name === voiceData.alias)) {
            await interaction.reply({
                content: `You already have the **${voiceData.display}** voice!`,
                ephemeral: true
            })
            return
        }

        //#region Add the new voice role

        // Check if the role already exists
        let newVoiceRole: Role = guildRoles.find(r => r.name === `${voiceData.alias}_nb`) as Role

        if (!newVoiceRole) {
            // Create the role & give it
            const createdRole: Role = await userGuild.roles.create({
                name: `${voiceData.alias}_nb`
            })

            newVoiceRole = createdRole
        }
        await user.roles.add(newVoiceRole)

        //#endregion


        await interaction.reply({
            content: `Set the voice to **${voiceData.display}**!`,
            ephemeral: true
        })
    }

}