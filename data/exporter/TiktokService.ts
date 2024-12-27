import { AudioService } from "../../types/basic";
import ExporterUtils from "../utils/ExporterUtils";
import axios from 'axios'

export default class TiktokService implements AudioService {
    public id: string = 'TIKTOK'

    /*
        A TikTok session ID that can and will expire, you'll need to login via the website on PC and grab the sessionId cookie.
        You can use a browser extension to fetch the cookie.
    */
    private sessionId: string = 'a5cfee374112f667749b9feaeaf9e970'

    public async export(text: string, voice: string, outputDir: string): Promise<void> {
        let baseUrl = 'https://api16-normal-useast5.us.tiktokv.com/media/api/text/speech/invoke/'
        
        baseUrl += `?text_speaker=${voice}&`
        baseUrl += `req_text=${text}&`
        baseUrl += 'speaker_map_type=0&aid=1233'
    
        const request = await axios.post(baseUrl, {}, {
            headers: {
                'User-Agent': 'com.zhiliaoapp.musically/2022600030 (Linux; U; Android 7.1.2; es_ES; SM-G988N; Build/NRD90M;tt-ok/3.12.13.1)',
                'Cookie': `sessionid=${this.sessionId}`
            }
        })
        const response = request.data
        console.log(response)
    }
}