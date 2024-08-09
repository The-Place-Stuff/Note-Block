import { AudioService } from "../../types/basic";
import ExporterUtils from "../utils/ExporterUtils";
import fetch from 'node-fetch'

export default class SamService implements AudioService {
    public id: string = 'SAPI'

    public async export(text: string, voice: string, outputDir: string): Promise<void> {
        const requestedData = await fetch(`https://www.tetyys.com/SAPI4/SAPI4?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voice)}`)
        const fetchedData = await requestedData.arrayBuffer()
        ExporterUtils.writeFile(outputDir, fetchedData)
    }
}