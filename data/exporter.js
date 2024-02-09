const say = require('say')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
const fs = require('fs')
const https = require('https')
const path = require("path")
const fakeYou = require('fakeyou.js')



// evaluate which type of audio to export from
async function exportAudio(text = '', voice = '', service = '', outputPath = '') {
  if (service == 'MICROSOFT') return exportMicrosoft(text, voice, outputPath)
  if (service == 'TIKTOK') return exportTikTok(text, voice, outputPath)
  if (service == 'UBERDUCK') return exportUberduck(text, voice, outputPath)
  if (service == 'SAPI') return exportSAPI(text, voice, outputPath)
  if (service == 'STREAMLABS') return exportStreamlabs(text, voice, outputPath)
  if (service == 'FAKEYOU') return exportFakeYou(text, voice, outputPath)
  if (service == 'ELEVENLABS') return exportElevenLabs(text, voice, outputPath)
}

//
// Exports audio using Microsoft's built-in voices
//
function exportMicrosoft(text = '', voice = '', outputPath = '') {
  return new Promise((resolve, reject) => {
    say.export(text, voice, 1, outputPath, err => {
      if (err) {
        console.log(err)
        reject()
      }
      resolve()
    })
  })
}

//
// Exports audio using Tiktok's API
//
async function exportTikTok(text = '', voice = '', outputPath = '') {
  const data = {
    text,
    voice
  }

  const requestedData = await fetch('https://tiktok-tts.weilnet.workers.dev/api/generation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  const fetchedData = await requestedData.json()
  fs.writeFileSync(path.join(path.dirname(__dirname), outputPath), Buffer.from(fetchedData.data, 'base64'))
}

//
// Exports audio using Sam API
//
async function exportSAPI(text = '', voice = '', outputPath = '') {
  const requestedData = await fetch(`https://www.tetyys.com/SAPI4/SAPI4?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voice)}`)
  const fetchedData = await requestedData.arrayBuffer()

  fs.writeFileSync(path.join(path.dirname(__dirname), outputPath), Buffer.from(fetchedData, 'base64'))
}

//
// Export audio using Uberduck's API
//
async function exportUberduck(text = '', voice = '', outputPath = '') {
  const url = 'https://api.uberduck.ai/speak-synchronous'
  const data = {
    voice,
    speech: text,
    pace: 1
  }
  const dataRequest = await fetch(url, {
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
  fs.writeFileSync(path.join(path.dirname(__dirname), outputPath), Buffer.from(bufferData, 'base64'))
}

//
// Export audio using Steamlabs Polly API
//
async function exportStreamlabs(text = '', voice = '', outputPath = '') {
  const data = {
    voice: voice,
    text: text
  }
  const requestedData = await fetch('https://streamlabs.com/polly/speak', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  const fetchedData = await requestedData.json()

  await downloadAudio(fetchedData.speak_url, outputPath)
}

//
// Export audio using FakeYou API
//
async function exportFakeYou(text = '', voice = '', outputPath = '') {
  const client = new fakeYou.Client({
    usernameOrEmail: 'warheadaidungeon@gmail.com',
    password: 'theplace'
  })
  await client.start()
  const searchedModels = fy.searchModel(voice);
  let model = searchedModels.first()

  const result = await model.request(text)
  fs.writeFileSync(path.join(path.dirname(__dirname), outputPath), Buffer.from(await result.getAudio(), 'base64'))
}

async function exportElevenLabs(text = '', voice = '', outputPath = '') {
  const data = {
    text,
    voice_settings: {
      stability: 0.5,
      similarity_boost: 1,
      style: 1
    }
  }
  const request = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  const resultJson = await request.json()

  if (resultJson) {
    throw Error(JSON.stringify(resultJson, null, 4))
  }
  const resultBuffer = await request.arrayBuffer()
  fs.writeFileSync(path.join(path.dirname(__dirname), outputPath), Buffer.from(resultBuffer, 'base64'))
}


// Used to download audio to tts.wav, takes in a url.
async function downloadAudio(url, outputPath = '') {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const file = fs.createWriteStream(path.join(path.dirname(__dirname), outputPath))
      res.pipe(file)

      file.on('finish', () => {
        file.close()
        resolve()
      })
      file.on('error', (err) => {
        console.log(err)
        file.close()
        reject(err)
      })
    })
  })
}

module.exports = exportAudio
