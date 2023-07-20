const say = require('say')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
const fs = require('fs')
const https = require('https')
const path = require("path")

// evaluate which type of audio to export from
async function exportAudio(text = '', voice = '', service = '', filepath = '') {
  if (service == 'MICROSOFT') return exportMicrosoft(text, voice, filepath)
  if (service == 'TIKTOK') return exportTikTok(text, voice, filepath)
  if (service == 'UBERDUCK') return exportUberduck(text, voice, filepath)
  if (service == 'SAPI') return exportSAPI(text, voice, filepath)
  if (service == 'STREAMLABS') return exportStreamlabs(text, voice, filepath)
}

//
// Exports audio using Microsoft's built-in voices
//
function exportMicrosoft(text = '', voice = '', filepath = '') {
  return new Promise((resolve, reject) => {
    say.export(text, voice, 1, filepath, err => {
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
async function exportTikTok(text = '', voice = '', filepath = '') {
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

  try {
    fs.writeFileSync(filepath, Buffer.from(fetchedData.data, 'base64'))
  }
  catch (err) {
    console.log("Invalid message format, Buffer only takes in string")
  }
}

//
// Exports audio using Sam API
//
async function exportSAPI(text = '', voice = '', filepath = '') {
  const requestedData = await fetch(`https://www.tetyys.com/SAPI4/SAPI4?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voice)}`)

  const fetchedData = await requestedData.arrayBuffer()

  try {
    fs.writeFileSync(filepath, Buffer.from(fetchedData, 'base64'))
  }
  catch (err) {
    console.log("Invalid message format, Buffer only takes in string")
  }
}

//
// Export audio using Uberduck's API
//
async function exportUberduck(text = '', voice = '', filepath = '') {
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
  try {
    fs.writeFileSync(filepath, Buffer.from(bufferData, 'base64'))
  }
  catch (err) {
    console.log(err)
  }
}

//
// Export audio using Steamlabs Polly API
//
async function exportStreamlabs(text = '', voice = '', filepath = '') {
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

  await downloadAudio(fetchedData.speak_url, filepath)
}

// Used to download audio to tts.wav, takes in a url.
async function downloadAudio(url, filepath = '') {
  return new Promise((resolve, reject) => {
    try {
      https.get(url, (res) => {
        const file = fs.createWriteStream(filepath)
        res.pipe(file)

        file.on('finish', () => {
          file.close()
          resolve()
        })
      })
    } catch (err) {
      console.log(err)
      reject(err)
    }
  })
}

module.exports = exportAudio
