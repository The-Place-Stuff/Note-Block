import { AudioService } from "../../types/basic";
import ExporterUtils from "../utils/ExporterUtils";
import fetch from 'node-fetch'

export default class TiktokService implements AudioService {
    public id: string = 'TIKTOK'

    public async export(text: string, voice: string, outputDir: string): Promise<void> {
        const data = { text, voice }
        const request = await fetch('https://tiktok-tts.weilnet.workers.dev/api/generation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        const fetchedData: any = await request.json()
        ExporterUtils.writeFile(outputDir, fetchedData.data)
    }
}