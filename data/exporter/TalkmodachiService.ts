import axios from "axios";
import { AudioService, TalkmodachiVoiceData, VoiceData } from "../../types/basic";
import ExporterUtils from "../utils/ExporterUtils";

export default class TalkmodachiService implements AudioService {
    public id: string = 'TALKMODACHI'

    public async export(text: string, voice: VoiceData, outputDir: string): Promise<void> {
        const talkmodachiVoice = voice as TalkmodachiVoiceData

        const request = await axios.get(`https://talkmodachi.dylanpdx.io/tts`, {
            params: {
                text,
                pitch: talkmodachiVoice.pitch,
                speed: talkmodachiVoice.speed,
                quality: talkmodachiVoice.quality,
                tone: talkmodachiVoice.tone,
                accent: talkmodachiVoice.accent,
                intonation: talkmodachiVoice.intonation,
                lang: talkmodachiVoice.lang
            },
            responseType: 'arraybuffer'
        });
        const response = request.data

        ExporterUtils.writeFile(outputDir, Buffer.from(response, 'base64'))
    }
}