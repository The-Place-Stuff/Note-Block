import { Voice } from "../../types/basic";
import { readFileSync } from 'fs'
import * as PATH from 'path'

export class VoiceUtils {

    public static voiceMap: Map<string, Voice> = new Map()

    public static buildVoices() {
        const voices = JSON.parse(readFileSync(PATH.join(__dirname, '../assets/voices.json'), 'utf-8'))
        const keys = Object.keys(voices)
        this.voiceMap.clear()
        keys.forEach(key => this.voiceMap.set(key, voices[key]))
    }

    public static getVoice(name: string) {
        return this.voiceMap.get(name) as Voice
    }
}