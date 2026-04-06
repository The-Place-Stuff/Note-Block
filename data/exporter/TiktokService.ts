import { AudioService, StandardVoiceData, VoiceData } from "../../types/basic";
import ExporterUtils from "../utils/ExporterUtils";
import axios from 'axios'

export default class TiktokService implements AudioService {
    public id: string = 'TIKTOK'

    public async export(text: string, voice: VoiceData, outputDir: string): Promise<void> {
        const standardVoice = voice as StandardVoiceData

        const body = {
            text,
            voice: standardVoice.id
        }
    
        const request = await axios.post('https://tiktok-tts.weilnet.workers.dev/api/generation', JSON.stringify(body), {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const response = request.data

        ExporterUtils.writeFile(outputDir, Buffer.from(response.data, 'base64'))
    }
}