import { ChatInputCommandInteraction, InteractionResponse } from "discord.js";
import { Override } from "../../types/basic.d";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

export class OverrideUtils {
    private static overridesFile: Override[] = JSON.parse(readFileSync(path.join(__dirname, '.././assets/overrides.json'), 'utf-8'))

    public static async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand()

        //Get an override
        if (subcommand == 'get') {
            const overrand: string = interaction.options.getString('overrand', true)
            const index: number = OverrideUtils.overridesFile.findIndex((o: any) => o.overrand == overrand)
            const override: Override = this.overridesFile[index]

            if (override == null) {
                return interaction.reply({
                    content: `There is no registered override for **${overrand}**.`,
                    ephemeral: true
                })
            } else {
                return interaction.reply({
                    content: `The override for **${overrand}** was fetched successfully.\n\n**Overrand:** ${overrand}\n**Override:** ${override.override}\n**Match Word:** ${override.match_word}`,
                    ephemeral: true
                })
            }
        }

        //Add an override
        if (subcommand == 'add') {
            const overrand = interaction.options.getString('overrand', true)
            const override = interaction.options.getString('override', true)
            let match_word = interaction.options.getBoolean('match_word') as boolean

            // Default to false if not provided
            if (match_word == null) match_word = false

            await OverrideUtils.addOverrand(interaction, override, overrand, match_word)
        }

        //Remove an overrand
        if (subcommand == 'remove') {
            const overrand = interaction.options.getString('overrand', true)

            await OverrideUtils.removeOverrand(interaction, overrand)
        }
    }

    private static async addOverrand(interaction: ChatInputCommandInteraction, override: string, overrand: string, match_word: boolean = false): Promise<InteractionResponse> {
        // Check if the override already exists
        const duplicate: number = OverrideUtils.overridesFile.findIndex((o: any) => o.overrand == overrand)

        if (duplicate !== -1) {
            //Edit duplicate to support new override
            OverrideUtils.overridesFile[duplicate].override = override

            // Save the file
            OverrideUtils.saveOverrides(OverrideUtils.overridesFile)

            return await interaction.reply({
                content: `Successfully replaced override for **${overrand}**.\n\n**Overrand:** ${overrand}\n**Override:** ${override}\n**Match Word:** ${match_word}`,
            })
        }

        // Add the override to the file
        OverrideUtils.overridesFile.push({
            overrand: overrand,
            override: override,
            match_word: match_word
        })

        // Save the file
        OverrideUtils.saveOverrides(OverrideUtils.overridesFile)

        return await interaction.reply({
            content: `Successfully added override for **${overrand}**.\n\n**Overrand:** ${overrand}\n**Override:** ${override}\n**Match Word:** ${match_word}`,
        })
    }

    private static async removeOverrand(interaction: ChatInputCommandInteraction, overrand: string): Promise<InteractionResponse> {
        //Check if the overrand exists
        const index: number = OverrideUtils.overridesFile.findIndex((o: any) => o.overrand == overrand)

        if (!index) {
            return await interaction.reply({
                content: `There is no registered override for **${overrand}**.`,
            })
        }

        // Remove the override from the file
        OverrideUtils.overridesFile.splice(index, 1)

        // Save the file
        OverrideUtils.saveOverrides(this.overridesFile)

        return await interaction.reply({
            content: `Successfully removed override for **${overrand}**.`
        })
    }

    private static saveOverrides(overrides: Override[]): void {
        // Save the overrides to the file
        writeFileSync(path.join(__dirname, '.././assets/overrides.json'), JSON.stringify(overrides, null, 4))
    }
}