import { AudioService } from "../../types/basic";
import ExporterUtils from "../utils/ExporterUtils";
import * as Crypto from 'crypto'
import axios from 'axios'

export default class FakeYouService implements AudioService {
    public id: string = 'FAKEYOU'

    public async export(text: string, voice: string, outputDir: string): Promise<void> {
        const inferenceResponse = await this.fetchInference(text, voice)
        if (!inferenceResponse.success) {
            throw Error('Failed to infer text.')
        }
        const inferenceToken = inferenceResponse.inference_job_token
        const url = await this.fetchAudioUrl(inferenceToken)
        await ExporterUtils.writeFileFromUrl(outputDir, url)
    }

    private async fetchAudioUrl(inferenceToken: string): Promise<string> {
        let urlSuffix = undefined
        while (true) {
            const request = await axios({
                url: `https://api.fakeyou.com/tts/job/${inferenceToken}`,
                method: 'get',
                headers: {
                    'Accept': 'application/json'
                }
            })
            const response = request.data
            const path = response.state.maybe_public_bucket_wav_audio_path
            
            if (typeof path != 'string') {
                await new Promise(res => setTimeout(res, 1000))
            }
            else {
                urlSuffix = path
                break
            }
        }
        return `https://storage.googleapis.com/vocodes-public${urlSuffix}`
    }

    private async fetchInference(text: string, voice: string): Promise<any> {
        const data = {
            uuid_idempotency_token: Crypto.randomUUID(),
            tts_model_token: voice,
            inference_text: text
        }
        const request = await axios({
            url: 'https://api.fakeyou.com/tts/inference',
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data
        })
        return request.data
    }
}