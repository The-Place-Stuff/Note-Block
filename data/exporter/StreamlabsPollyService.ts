import { AudioService } from "../../types/basic";
import ExporterUtils from "../utils/ExporterUtils";
import axios from 'axios'

export default class StreamlabsPollyService implements AudioService {
    public id: string = 'STREAMLABS'

    public async export(text: string, voice: string, outputDir: string): Promise<void> {
        const data = { voice, text }
        const request = await axios({
            url: 'https://streamlabs.com/polly/speak',
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Referer': 'https://streamlabs.com'
            },
            data
        })
        const response = request.data
        await ExporterUtils.writeFileFromUrl(outputDir, response.speak_url)
    }
}