import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, ChatInputCommandInteraction, APIApplicationCommandOptionChoice, Guild, Collection, Role, GuildMember } from "discord.js";
import { SlashCommand } from "../types/basic";
import voices from '../data/voices.json'
import { CommandReplyer } from "../data/commandReplyer";

export default class VoiceCommand implements SlashCommand {

    // Grabs choices, takes in a category for each subcommand
    private getChoices(category: string | undefined) {
        const config: APIApplicationCommandOptionChoice<string>[] = []

        for (const voice of voices) {
            if (voice.category == category || typeof category == 'undefined') {
                config.push({
                    name: voice.display,
                    value: voice.alias
                })
            }
        }
        return config
    }

    public data: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('voice')
    .setDescription('Pick a voice') 
    .addSubcommand(subCommand => {
        return subCommand.setName("microsoft")
        .setDescription("Pick a voice from the Microsoft category")
        .addStringOption(option => {
            return option.setName('voice')
            .setDescription('Choose a voice!')
            .addChoices(...this.getChoices("microsoft"))
            .setRequired(true)
        })
        
    })
    .addSubcommand(subCommand => {
        return subCommand.setName("base_tiktok")
        .setDescription("Pick a voice from the TikTok category")
        .addStringOption(option => {
            return option.setName('voice')
            .setDescription('Choose a voice!')
            .addChoices(...this.getChoices("base_tiktok"))
            .setRequired(true)
        })
    })
    .addSubcommand(subCommand => {
        return subCommand.setName("media")
        .setDescription("Pick a voice from the external media category")
        .addStringOption(option => {
            return option.setName('voice')
            .setDescription('Choose a voice!')
            .addChoices(...this.getChoices("media"))
            .setRequired(true)
        })
    })
    .addSubcommand(subCommand => {
        return subCommand.setName("foreign")
        .setDescription("Pick a voice from the foreign category")
        .addStringOption(option => {
            return option.setName('voice')
            .setDescription('Choose a voice!')
            .addChoices(...this.getChoices("foreign"))
            .setRequired(true)
        })
    })
    .addSubcommand(subCommand => {
        return subCommand.setName("vocal")
        .setDescription("Pick a voice from the vocal category")
        .addStringOption(option => {
            return option.setName('voice')
            .setDescription('Choose a voice!')
            .addChoices(...this.getChoices("vocal"))
            .setRequired(true)
        })
    })
    .addSubcommand(subCommand => {
        return subCommand.setName("alternate")
        .setDescription("Pick a voice from the alternate category")
        .addStringOption(option => {
            return option.setName('voice')
            .setDescription('Choose a voice!')
            .addChoices(...this.getChoices("alternate"))
            .setRequired(true)
        })
    })
    .addSubcommand(subCommand => {
        return subCommand.setName("spongebob")
        .setDescription("Pick a voice from the spongebob category")
        .addStringOption(option => {
            return option.setName('voice')
            .setDescription('Choose a voice!')
            .addChoices(...this.getChoices("spongebob"))
            .setRequired(true)
        })
    })
    .addSubcommand(subCommand => {
        return subCommand.setName("blah")
        .setDescription("Pick a voice from the blah category")
        .addStringOption(option => {
            return option.setName('voice')
            .setDescription('Choose a voice!')
            .addChoices(...this.getChoices("blah"))
            .setRequired(true)
        })
    })
    .addSubcommand(subCommand => {
        return subCommand.setName("clear")
        .setDescription("Clears voice")
    }) as SlashCommandBuilder

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
        if (!this.getChoices(undefined).find(v => v.value === voice)) {
            await interaction.reply({
                content: "That voice is not valid!",
                ephemeral: true
            })
            return
        }

        const voiceData = this.getChoices(undefined).find(v => v.value === voice) as APIApplicationCommandOptionChoice<string>

        


        // If the user already has the voice
        if (user.roles.cache.find(r => r.name === voiceData.name)) {
            await interaction.reply({
                content: `You already have the **${voiceData.name}** voice!`,
                ephemeral: true
            })
            return
        }

        //#region Add the new voice role

        // Check if the role already exists
        let newVoiceRole: Role = guildRoles.find(r => r.name === `${voiceData.value}_nb`) as Role

        if (!newVoiceRole) {
            // Create the role & give it
            const createdRole: Role = await userGuild.roles.create({
                name: `${voiceData.value}_nb`
            })

            newVoiceRole = createdRole
        }
        await user.roles.add(newVoiceRole)

        //#endregion


        await interaction.reply({
            embeds: [
                {
                    title: 'voice',
                    description: CommandReplyer.getReply(interaction.user.id, 'voice'),
                    thumbnail: {
                        url: 'https://images-ext-2.discordapp.net/external/82cdlfs7VXGWRAznTIOpL16NR6NCU9fyOFHX2Cf9AG4/%3Fsize%3D1024/https/cdn.discordapp.com/avatars/1081717850722553906/e2704cd816d628b43e8b999c4afd2a88.png?width=671&height=671'
                    }
                }
            ]
        })
    }
}