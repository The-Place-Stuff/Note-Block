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
    //Filter emoji
    const emojiMatches = text.match(/<a*:\w+:\d+>/g);

    if (emojiMatches != null) {
      for (const rawEmoji of emojiMatches) {
        const match: RegExpMatchArray = rawEmoji.match(/\w+(?=:\d+>)/) as RegExpMatchArray

        text = text.replaceAll(rawEmoji, `(${match[0]})`)
      }
    }

    //Filter URL links
    const urlMatches = text.match(/https?:\/\/[^\s]+/g);

    if (urlMatches != null) {
      for (const url of urlMatches) {
        const match: RegExpMatchArray = url.match(/(?<=\/)[\w-.]+/) as RegExpMatchArray

        text = text.replaceAll(url, match[0].replaceAll('.', ' dot '))
      }
    }

    //Filter user mentions
    const userMatches = text.match(/<@!?\d+>/g);

    if (userMatches != null) {
      for (const userMention of userMatches) {
        const match: RegExpMatchArray = userMention.match(/\d+/) as RegExpMatchArray
        const user: User = await this.client.users.fetch(match[0])

        text = text.replaceAll(userMention, user.username)
      }
    }

    //Filter channel links
    const channels = text.match(/<#\d+>/g);

    if (channels != null) {
      for (const id of channels) {
        const match: RegExpMatchArray = id.match(/\d+/) as RegExpMatchArray
        const channel: GuildChannel = await this.client.channels.fetch(match[0]) as GuildChannel

        text = text.replaceAll(id, channel.name ?? id)
      }
    }

    //Filter code blocks
    text = text.replaceAll(/(`{3})[\S\s]+?[^\\]\1/g, '()')

    return text
  }
}
