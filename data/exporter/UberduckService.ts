import { AudioService } from "../../types/basic"
import ExporterUtils from "../utils/ExporterUtils"
import axios from 'axios'

export default class UberduckService implements AudioService {
    public id: string = 'UBERDUCK'

    public async export(text: string, voice: string, outputDir: string): Promise<void> {
        const data = {
            voice,
            speech: text,
            pace: 1
        }
        const request = await axios({
            url: 'https://api.uberduck.ai/speak-synchronous',
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'uberduck-id': 'anonymous',
                'Content-Type': 'application/json',
                Authorization: 'Basic cHViX2ZjZWdqcXJocXZreWpjd2VwdDpwa19iMjYyMzI3MC02YTFjLTQ1M2QtYjI3Mi1iODRiYmI5YTVmNDg='
            },
            responseType: 'arraybuffer',
            data
        })
        const response = request.data
        ExporterUtils.writeFile(outputDir, response)
    }
}