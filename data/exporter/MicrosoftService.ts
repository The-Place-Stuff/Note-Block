import { AudioService, StandardVoiceData, VoiceData } from "../../types/basic"
const say = require('say')

export default class MicrosoftService implements AudioService {
    public id: string = 'MICROSOFT'

    public async export(text: string, voice: VoiceData, outputDir: string): Promise<void> {
        const standardVoice = voice as StandardVoiceData

        return new Promise((res, rej) => say.export(text, standardVoice.id, 1, outputDir, (err: any) => {
            if (err) {
                rej()
            }
            res()
        }))
    }
}