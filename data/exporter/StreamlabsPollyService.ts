import { AudioService, StandardVoiceData, VoiceData } from "../../types/basic";
import ExporterUtils from "../utils/ExporterUtils";
import axios from 'axios'

export default class StreamlabsPollyService implements AudioService {
    public id: string = 'STREAMLABS'

    public async export(text: string, voice: VoiceData, outputDir: string): Promise<void> {
        const standardVoice = voice as StandardVoiceData

        const data = { voice: standardVoice.id, text }
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