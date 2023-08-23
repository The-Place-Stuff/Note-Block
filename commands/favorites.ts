import { SlashCommandBuilder } from '@discordjs/builders'
import { Client, ChatInputCommandInteraction } from 'discord.js'
import { SlashCommand, User, Voice } from '../types/basic'
import { Data } from "../data/utils/DataUtils"
import { VoiceUtils } from '../data/utils/VoiceUtils'

const maxFavorites: number = 10

export default class FavoritesCommand implements SlashCommand {
    public data = new SlashCommandBuilder()
        .setName('favorites')
        .setDescription("Manages your favorited voices.")
        .addSubcommand(subcommandGroup =>
            subcommandGroup
                .setName('add')
                .setDescription("Adds either your current voice or a given voice to your favorites.")
                .addStringOption(option =>
                    option
                        .setName('voice')
                        .setDescription('Voice ID or name')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommandGroup =>
            subcommandGroup
                .setName('remove')
                .setDescription("Removes a given voice from your favorited voices.")
                .addStringOption(option =>
                    option
                        .setName('voice')
                        .setDescription('Voice name')
                        .addChoices()
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommandGroup =>
            subcommandGroup
                .setName('list')
                .setDescription("Lists all of your favorited voices.")
        )
        .addSubcommand(subcommandGroup =>
            subcommandGroup
                .setName('clear')
                .setDescription("Clears all of your favorited voices.")
        ) as SlashCommandBuilder

    public async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const subcommand: string = interaction.options.getSubcommand(true)
        const user: User = Data.getOrCreateUser(interaction.user.id, client)

        if (!user.favorites) {
            user.favorites = []
            Data.updateUserData(user, client)
        }

        if (subcommand == 'list') {
            const content: string = this.listFavorites(user)

            return interaction.reply({
                content: content,
                ephemeral: true
            })
        }

        const parameter: string = interaction.options.getString('voice', false) ?? user.voice ?? null
        let voice: Voice | undefined = VoiceUtils.voiceMap.get(parameter)

        if (!voice) {
            VoiceUtils.voiceMap.forEach((value, key) => {
                if (parameter == value.name) {
                    voice = VoiceUtils.voiceMap.get(key)
                }
            })

            if (!voice) {
                return interaction.reply({
                    content: !parameter ? 'You must provide the identifier of a voice to favorite!' : `\`**${parameter}\` is not a valid voice!`,
                    ephemeral: true
                })
            }
        }

        let content: string

        switch (subcommand) {
            case 'add':
                content = this.addFavorite(client, user, parameter)
                break
            case 'remove':
                content = this.removeFavorite(client, user, parameter)
                break
            case 'clear':
                content = this.clearFavorites(client, user)
        }

        if (content!) {
            return interaction.reply({
                content: content,
                ephemeral: true
            })
        }
    }

    private addFavorite(client: Client, user: User, voice: string) {
        if (user.favorites.includes(voice)) return 'You\'ve already favorited that voice!'
        if (user.favorites.length >= maxFavorites) return `You cannot have more than ${maxFavorites} favorited voices.`

        user.favorites.push(voice)
        Data.updateUserData(user, client)

        return `**${VoiceUtils.getVoice(voice).name}** was added to your favorites!`
    }

    private removeFavorite(client: Client, user: User, voice: string) {
        const name: string = VoiceUtils.getVoice(voice).name

        if (user.favorites.includes(voice)) return `Don't worry – ${name} is not in your favorites!`

        user.favorites.splice(user.favorites.indexOf(voice))
        Data.updateUserData(user, client)

        return `**${name}** was removed from your favorites.`
    }

    private clearFavorites(client: Client, user: User) {
        user.favorites = []
        Data.updateUserData(user, client)

        return 'Your favorited voices were cleared.'
    }

    private listFavorites(user: User) {
        const favorites: string[] = user.favorites ?? []

        if (favorites.length == 0) {
            return 'You have no favorited voices. Get started by using `/favorites add`!'
        } else {
            let content: string =
                `**You have ${favorites.length} favorited ${favorites.length == 1 ? 'voice' : 'voices'}.** You can have up to ${maxFavorites} favorites!`

            for (let i = 0; i < favorites.length; i++) {
                content += `\n${i + 1}. ${VoiceUtils.getVoice(favorites[i]).name}`
            }

            return content
        }
    }
}