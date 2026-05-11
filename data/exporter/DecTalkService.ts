import { AudioService, VoiceData } from "../../types/basic";
import { say } from 'dectalk'
import ExporterUtils from "../utils/ExporterUtils";

export default class DecTalkService implements AudioService {
    public id: string = 'DECTALK'
    
    public async export(text: string, voice: VoiceData, outputDir: string): Promise<void> {
        const data = await say(text, {
            EnableCommands: true
        })
        ExporterUtils.writeFile(outputDir, data)
    }
}