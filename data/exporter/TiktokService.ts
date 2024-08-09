import { AudioService } from "../../types/basic";
import ExporterUtils from "../utils/ExporterUtils";
import axios from 'axios'

export default class TiktokService implements AudioService {
    public id: string = 'TIKTOK'

    public async export(text: string, voice: string, outputDir: string): Promise<void> {
        const data = { text, voice }

        const request = await axios({
            url: 'https://tiktok-tts.weilnet.workers.dev/api/generation',
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            data
        })
        const response = request.data
        ExporterUtils.writeFile(outputDir, response.data)
    }
}