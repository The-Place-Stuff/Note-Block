import { SlashCommandBuilder, ChatInputCommandInteraction, CacheType, Client, GuildMember, APIInteractionGuildMember } from "discord.js";
import { SlashCommand } from "../types/basic";


export default class AdminCommand implements SlashCommand {

    public data: SlashCommandBuilder = new SlashCommandBuilder()
    .setName("admin")
    .setDescription("Currently in construction!")
    

    public async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const member = await interaction.guild?.members.fetch({
            user: interaction.user
        }) as GuildMember
        const highestRole = member.roles.highest

        if (highestRole.name != "Noteblock Admin") {
            return interaction.reply({
                content: "Insufficient permissions to run this command!",
                ephemeral: true
            })
        }
        
        return interaction.reply({
            content: "under construction",
            ephemeral: true
        })
    }    
}