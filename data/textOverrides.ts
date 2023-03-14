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
}
