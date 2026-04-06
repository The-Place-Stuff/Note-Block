import { AudioService, StandardVoiceData, VoiceData } from "../../types/basic";
import ExporterUtils from "../utils/ExporterUtils";
import axios from 'axios'

export default class SAPIService implements AudioService {
    public id: string = 'SAPI'

    public async export(text: string, voice: VoiceData, outputDir: string): Promise<void> {
        const standardVoice = voice as StandardVoiceData

        const request = await axios({
            url: `https://www.tetyys.com/SAPI4/SAPI4?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(standardVoice.id)}`,
            responseType: 'arraybuffer'
        })
        const response = request.data

        ExporterUtils.writeFile(outputDir, Buffer.from(response, 'base64'))
    }
}