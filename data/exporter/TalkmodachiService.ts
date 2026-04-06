import axios from "axios";
import { AudioService } from "../../types/basic";
import ExporterUtils from "../utils/ExporterUtils";

export default class TalkmodachiService implements AudioService {
    public id: string = 'TALKMODACHI'

    public async export(text: string, voice: string, outputDir: string): Promise<void> {
        const request = await axios.get(`https://talkmodachi.dylanpdx.io/tts`, {
            params: {
                text,
                pitch: 50,
                speed: 50,
                quality: 50,
                tone: 50,
                accent: 50,
                intonation: 1,
                lang: 'useng'
            },
            responseType: 'arraybuffer'
        });
        const response = request.data

        ExporterUtils.writeFile(outputDir, Buffer.from(response, 'base64'))
    }
}