import { AudioService } from "../../types/basic";
import ExporterUtils from "../utils/ExporterUtils";
import axios from 'axios'

export default class SamService implements AudioService {
    public id: string = 'SAPI'

    public async export(text: string, voice: string, outputDir: string): Promise<void> {
        const request = await axios({
            url: `https://www.tetyys.com/SAPI4/SAPI4?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voice)}`,
            responseType: 'arraybuffer'
        })
        const response = request.data
        ExporterUtils.writeFile(outputDir, response)
    }
}