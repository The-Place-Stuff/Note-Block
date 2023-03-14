export class TextOverrides {
  public applyOverrides(text: string) {
    const overridesJson = require('./overrides.json')

    for (const line of Object.keys(overridesJson)) {
      const matchWord = overridesJson[line].match_word
      const overrand = overridesJson[line].overrand
      const override = overridesJson[line].override

      if (matchWord) {
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
        const match = rawEmoji.match(/\w+(?=:\d+>)/)

        if (match == null) continue

        text = text.replaceAll(rawEmoji, `(${match[0]})`)
      }
    }

    //Filter URL links
    const urlMatches = text.match(/https?:\/\/[^\s]+/g);

    if (urlMatches != null) {
      for (const url of urlMatches) {
        const match = url.match(/(?<=\/)[\w-.]+/)

        if (match == null) continue

        text = text.replaceAll(url, match[0])
      }
    }

    //Filter code blocks
    text = text.replaceAll(/(`{3})[\S\s]+?[^\\]\1/g, '()')

    return text.replaceAll('_', ' ')
  }
}
