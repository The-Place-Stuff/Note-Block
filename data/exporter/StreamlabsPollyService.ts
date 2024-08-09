import { AudioService } from "../../types/basic";
import ExporterUtils from "../utils/ExporterUtils";
import fetch from 'node-fetch'

export default class StreamlabsPollyService implements AudioService {
    public id: string = 'STREAMLABS'

    public async export(text: string, voice: string, outputDir: string): Promise<void> {
        const data = {
            voice: voice,
            text: text
        }
        const requestedData = await fetch('https://streamlabs.com/polly/speak', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Referer': 'https://streamlabs.com'
            },
            body: JSON.stringify(data)
        })
        const fetchedData: any = await requestedData.json()
        await ExporterUtils.writeFileFromUrl(outputDir, fetchedData.speak_url)
    }
}