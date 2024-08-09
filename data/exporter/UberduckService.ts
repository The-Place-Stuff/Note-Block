import { AudioService } from "../../types/basic"
import ExporterUtils from "../utils/ExporterUtils"
import fetch from 'node-fetch'

export default class UberduckService implements AudioService {
    public id: string = 'UBERDUCK'

    public async export(text: string, voice: string, outputDir: string): Promise<void> {
        const data = {
            voice,
            speech: text,
            pace: 1
        }
        const dataRequest = await fetch('https://api.uberduck.ai/speak-synchronous', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'uberduck-id': 'anonymous',
                'Content-Type': 'application/json',
                Authorization: 'Basic cHViX2ZjZWdqcXJocXZreWpjd2VwdDpwa19iMjYyMzI3MC02YTFjLTQ1M2QtYjI3Mi1iODRiYmI5YTVmNDg='
            },
            body: JSON.stringify(data)
        })
        const bufferData = await dataRequest.arrayBuffer()
        ExporterUtils.writeFile(outputDir, bufferData)
    }
}