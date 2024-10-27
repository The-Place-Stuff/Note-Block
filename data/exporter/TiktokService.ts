import { AudioService } from "../../types/basic";
import ExporterUtils from "../utils/ExporterUtils";
import axios from 'axios'

export default class TiktokService implements AudioService {
    public id: string = 'TIKTOK'

    public async export(text: string, voice: string, outputDir: string): Promise<void> {
        const data = { text, voice, base64: true }
    
        const request = await axios.post('https://tiktok-tts.weilbyte.dev/api/generate', data, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const response = request.data
        ExporterUtils.writeFile(outputDir, response)
    }
}