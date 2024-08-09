import { AudioService } from "../../types/basic"
const say = require('say')

export default class MicrosoftService implements AudioService {
    public id: string = 'MICROSOFT'

    public async export(text: string, voice: string, outputDir: string): Promise<void> {
        return new Promise((res, rej) => say.export(text, voice, 1, outputDir, (err: any) => {
            if (err) {
                rej()
            }
            res()
        }))
    }
}