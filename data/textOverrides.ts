import { Channel, Client, GuildChannel, User } from 'discord.js'
import { readFileSync } from 'fs'
import { Override } from '../types/basic'

export class TextOverrides {
    private client: Client

    private overridesJson: Override[] = JSON.parse(readFileSync('./data/assets/overrides.json', 'utf-8'))

    private constructor(client: Client) {
        this.client = client
    }

    public static async filter(text: string, client: Client) {
        const overrides: TextOverrides = new TextOverrides(client)

        text = await overrides.applyFilters(text)
        text = overrides.applyOverrides(text)

        return text
    }

    public applyOverrides(text: string) {
        for (const overrideSet of this.overridesJson) {
            const overrand = overrideSet.overrand
            const override = overrideSet.override

            if (overrideSet.match_word) {
                const regExp = new RegExp(`\\b${overrand}\\b`, 'g');

                text = text.replaceAll(regExp, override)
            } else {
                text = text.replaceAll(overrand, override)
            }
        }

        return text.replaceAll('_', ' ')
    }

    public async applyFilters(text: string) {
        text = text.replaceAll(/(`{3})[\S\s]+?[^\\]\1/g, '()')
        text = this.filterURLs(text)
        text = this.filterEmojis(text)
        text = await this.filterUserMentions(text)
        text = await this.filterChannelLinks(text)
        return text
    }

    private filterURLs(text: string) {
        const matches = text.match(/https?:\/\/[^\s]+/g);
        if (matches) {
            for (const url of matches) {
                const match: RegExpMatchArray = url.match(/(?<=\/)[\w-.]+/) as RegExpMatchArray

                text = text.replaceAll(url, match[0].replaceAll('.', ' dot '))
            }
        }
        return text
    }

    private filterEmojis(text: string) {
        const matches = text.match(/<a*:\w+:\d+>/g);
        if (matches) {
            for (const emoji of matches) {
                const match: RegExpMatchArray = emoji.match(/\w+(?=:\d+>)/) as RegExpMatchArray

                text = text.replaceAll(emoji, `(${match[0]})`)
            }
        }
        return text
    }

    private async filterUserMentions(text: string) {
        const matches = text.match(/<@!?\d+>/g);
        if (matches != null) {
            for (const userMention of matches) {
                const match: RegExpMatchArray = userMention.match(/\d+/) as RegExpMatchArray
                const user: User = await this.client.users.fetch(match[0])

                text = text.replaceAll(userMention, user.username)
            }
        }
        return text
    }

    private async filterChannelLinks(text: string) {
        const matches = text.match(/<#\d+>/g);
        if (matches != null) {
            for (const channelLink of matches) {
                const match: RegExpMatchArray = channelLink.match(/\d+/) as RegExpMatchArray
                const channel: GuildChannel = await this.client.channels.fetch(match[0]) as GuildChannel

                text = text.replaceAll(channelLink, channel.name ?? channelLink)
            }
        }
        return text
    }
}
