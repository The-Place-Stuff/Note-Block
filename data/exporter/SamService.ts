import SamJs from "sam-js";
import { AudioService } from "../../types/basic";
import ExporterUtils from "../utils/ExporterUtils";

export default class SamService implements AudioService {
    public id: string = 'SAM'
    
    public async export(text: string, voice: string, outputDir: string): Promise<void> {
        const speech = new SamJs({
            pitch: 64,
            speed: 72,
            mouth: 128,
            throat: 128
        })
         
        const wavData = await speech.wav(text);
        const arrayBuffer = wavData.buffer;

        await ExporterUtils.writeFile(outputDir, Buffer.from(arrayBuffer))
    }
}