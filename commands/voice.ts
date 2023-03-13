import { SlashCommandAttachmentOption, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Client, ChatInputApplicationCommandData, ChatInputCommandInteraction, APIApplicationCommandOption, APIApplicationCommandOptionChoice, Guild, Collection, Role, GuildMember } from "discord.js";
import { SlashCommand } from "../types/basic";
import { randomUUID } from "crypto";

export default class VoiceCommand implements SlashCommand {
    private config = {
        voices: [
            {
                name: "Chiko",
                value: "Microsoft Zira Desktop"
            },
            {
                name: "Outer",
                value: "Microsoft David Desktop"
            }
        ] as APIApplicationCommandOptionChoice<string>[]
    }

    public data: SlashCommandBuilder = new SlashCommandBuilder()
        .setName("voice")
        .setDescription("Pick a voice!")
        .addStringOption(option => {
            return option.setName("voice")
            .setDescription("The voice you want to use!")
            .setRequired(true)
            .addChoices(...this.config.voices)
        }) as SlashCommandBuilder // shady workaround :o

    public async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const voice: string = interaction.options.getString("voice") as string

        // Check if the voice is valid
        if (!this.config.voices.find(v => v.value === voice)) {
            await interaction.reply({
                content: "That voice is not valid!",
                ephemeral: true
            })
            return
        }

        const voiceData = this.config.voices.find(v => v.value === voice) as APIApplicationCommandOptionChoice<string>

        // User Data
        const userGuild: Guild = interaction.guild as Guild
        const guildRoles: Collection<string, Role> = await userGuild.roles.fetch()
        const user: GuildMember = await userGuild.members.fetch(interaction.user.id)


        // If the user already has the voice
        if (user.roles.cache.find(r => r.name === voiceData.name)) {
            await interaction.reply({
                content: `You already have the **${voiceData.name}** voice!`,
                ephemeral: true
            })
            return
        }

        // Remove the old voice role
        const userRoles: Collection<string, Role> = user.roles.cache

        const currentVoiceRole: Role = userRoles.find(r => r.name.endsWith("NOTEBLOCK")) as Role

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

        //#region Add the new voice role

        // Check if the role already exists
        let newVoiceRole: Role = guildRoles.find(r => r.name === `${voiceData.value} NOTEBLOCK`) as Role

        if (!newVoiceRole) {
            // Create the role & give it
            const createdRole: Role = await userGuild.roles.create({
                name: `${voiceData.value} NOTEBLOCK`
            })

            newVoiceRole = createdRole
        }

        await user.roles.add(newVoiceRole)

        //#endregion


        await interaction.reply({
            content: `Set the voice to **${voiceData.name}**!`,
            ephemeral: true
        })
    }
}