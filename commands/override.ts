import { ChatInputCommandInteraction, Client, InteractionResponse, SlashCommandBuilder } from "discord.js";
import { Override, SlashCommand } from "../types/basic";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

export default class OverrideCommand implements SlashCommand {
    public data: SlashCommandBuilder = new SlashCommandBuilder()
        .setName('override')
        .setDescription('Edit NoteBlock overrides')
        .addSubcommand(subcommand =>
            {
                return subcommand
                .setName('add')
                .setDescription('Add a new override')
                .addStringOption(option =>
                    {
                        return option
                        .setName('overrand')
                        .setDescription('The word to override')
                        .setRequired(true)
                    }
                )
                .addStringOption(option =>
                   {
                        return option
                        .setName('override')
                        .setDescription('The override')
                        .setRequired(true)
                   }
                )
                .addBooleanOption(option =>
                    {
                        return option
                        .setName('match_word')
                        .setDescription('Match the word exactly')
                        .setRequired(false)
                    }
                )
            }
        ) 
        .addSubcommand(subcommand =>
            {
                return subcommand
                .setName('remove')
                .setDescription('Remove an override')
                .addStringOption(option =>
                    {
                        return option
                        .setName('overrand')
                        .setDescription('The word to remove')
                        .setRequired(true)
                    }
                )
            }
        ) as SlashCommandBuilder

    private overridesFile: Override[] = JSON.parse(readFileSync(path.join(__dirname, '../data/assets/overrides.json'), 'utf-8'))

    public async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const subcommand = interaction.options.getSubcommand()
        
        //Add an override
        if (subcommand == 'add') {
            const overrand = interaction.options.getString('overrand', true)
            const override = interaction.options.getString('override', true) 
            let match_word = interaction.options.getBoolean('match_word') as boolean

            // Default to false if not provided
            if (match_word == null) match_word = false

            await this.addOverrand(interaction, override, overrand, match_word)
        }

        //Remove an overrand
        if (subcommand == 'remove') {
            const overrand = interaction.options.getString('overrand', true)

            await this.removeOverrand(interaction, overrand)
        }
    }

    private async addOverrand(interaction: ChatInputCommandInteraction, override: string, overrand: string, match_word: boolean = false): Promise<InteractionResponse> {
        // Check if the override already exists
        const duplicate: number = this.overridesFile.findIndex((o: any) => o.overrand == overrand)

        if (duplicate !== -1) {
            //Edit duplicate to support new override
            this.overridesFile[duplicate].override = override

            // Save the file
            this.saveOverrides(this.overridesFile)

            return await interaction.reply({
                content: `Successfully replaced override for ${overrand}\n\n**Overrand:** ${overrand}\n**Override:** ${override}\n**Match Word:** ${match_word}`,
            })
        }

        // Add the override to the file
        this.overridesFile.push({
            overrand: overrand,
            override: override,
            match_word: match_word
        })

        // Save the file
        this.saveOverrides(this.overridesFile)

        return await interaction.reply({
            content: `Successfully added overrand\n\n**Overrand:** ${overrand}\n**Override:** ${override}\n**Match Word:** ${match_word}`,
        })
    }

    private async removeOverrand(interaction: ChatInputCommandInteraction, overrand: string): Promise<InteractionResponse> {
        //Check if the overrand exists
        const index: number = this.overridesFile.findIndex((o: any) => o.overrand == overrand)

        if (!index) {
            return await interaction.reply({
                content: `Override for ${overrand} does not exist`,
            })
        }

        // Remove the override from the file
        this.overridesFile.splice(index, 1)

        // Save the file
        this.saveOverrides(this.overridesFile)

        return await interaction.reply({
            content: `Successfully removed override for ${overrand}`
        })
    }

    private saveOverrides(overrides: Override[]): void {
        // Save the overrides to the file
        writeFileSync(path.join(__dirname, '../data/assets/overrides.json'), JSON.stringify(overrides, null, 4))
    }
}
