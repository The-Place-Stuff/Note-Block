import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from "discord.js";
import { SlashCommand, VoiceEntry } from "../types/basic";
import { Data } from "../data/DataUtils";

export default class VoiceTestCommand implements SlashCommand {
    public data = new SlashCommandBuilder()
        .setName('voicetest')
        .setDescription("Set your voice. Currently under construction!")
        .addStringOption(choice =>
        {
            return choice
            .setName('voice')
            .setDescription('More voices coming soon!')
            .setRequired(true)
            .addChoices({
                name: "Roosey",
                value: "Microsoft Zira Desktop"
            },
            {
                name: "Outer",
                value: "Microsoft David Desktop"
            })
        }
    ) as SlashCommandBuilder

    public async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const voice = interaction.options.getString('voice', true)

        if (voice !== "Microsoft Zira Desktop" && voice !== "Microsoft David Desktop") {
            return interaction.reply({
                content: "This voice is not available!"
            })
        }

        const userData: VoiceEntry = Data.getUserData(interaction.user.id) ? Data.getUserData(interaction.user.id) as VoiceEntry : Data.writeNewUser({
            id: interaction.user.id,
            minecraft_name: false,
            voice: "none"
        }, client)

        userData.voice = voice

        Data.updateUserData(userData, client)

        return interaction.reply({
            content: `Your voice has been set to **${voice}**`
        })
    }
}