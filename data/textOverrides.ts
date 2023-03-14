import { Client } from 'discord.js'
import overridesJson from './overrides.json'

export class TextOverrides {
  private client: Client

  constructor(client: Client) {
    this.client = client
  }

  public static filter(text: string, client: Client) {
    const overrides: TextOverrides = new TextOverrides(client)

    text = overrides.applyFilters(text)
    text = overrides.applyOverrides(text)

    return text
  }

  public applyOverrides(text: string) {
    for (const overrideSet of overridesJson) {
      const overrand = overrideSet.overrand
      const override = overrideSet.override

      if (overrideSet.match_word) {
        const regExp = new RegExp(`\\b${overrand}\\b`, 'g');

        text = text.replaceAll(regExp, override)
      } else {
        text = text.replaceAll(overrand, override)
      }
    }

    return text
  }

  public applyFilters(text: string) {
    //Filter emoji
    const emojiMatches = text.match(/<a*:\w+:\d+>/g);

    if (emojiMatches != null) {
      for (const rawEmoji of emojiMatches) {
        const match = rawEmoji.match(/\w+(?=:\d+>)/)!

        text = text.replaceAll(rawEmoji, `(${match[0]})`)
      }
    }

    //Filter URL links
    const urlMatches = text.match(/https?:\/\/[^\s]+/g);

    if (urlMatches != null) {
      for (const url of urlMatches) {
        const match = url.match(/(?<=\/)[\w-.]+/)!

        text = text.replaceAll(url, match[0])
      }
    }

    //Filter user mentions
    const userMatches = text.match(/<@!?\d+>/g);

    if (userMatches != null) {
      for (const userMention of userMatches) {
        const match = userMention.match(/\d+/)!

        text = text.replaceAll(userMention, this.client.users.cache.get(match[0])!.username)
      }
    }

    //Filter code blocks
    text = text.replaceAll(/(`{3})[\S\s]+?[^\\]\1/g, '()')

    return text.replaceAll('_', ' ')
  }
}
