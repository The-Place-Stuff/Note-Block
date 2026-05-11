import SamJs from "sam-js";
import { AudioService, SamVoiceData, VoiceData } from "../../types/basic";
import ExporterUtils from "../utils/ExporterUtils";

export default class SamService implements AudioService {
    public id: string = 'SAM'
    
    public async export(text: string, voice: VoiceData, outputDir: string): Promise<void> {
        const samVoice = voice as SamVoiceData

        const speech = new SamJs({
            pitch: samVoice.pitch,
            speed: samVoice.speed,
            mouth: samVoice.mouth,
            throat: samVoice.throat,
        })
         
        const wavData = await speech.wav(text);
        const arrayBuffer = wavData.buffer;

        await ExporterUtils.writeFile(outputDir, Buffer.from(arrayBuffer))
    }
}