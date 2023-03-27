const say = require('say')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
const fs = require('fs')
import { dirname, join } from 'path'


// evaluate which type of audio to export from
async function exportAudio(text = '', voice = '', voiceType = '') {  
  if (voiceType == 'tiktok') {
    await exportTikTok(text, voice)
  }
  else if (voiceType == 'sapi') {
    await exportSAPI(text, voice)
  }
  else {
    await exportMicrosoft(text, voice)
  }
}

function exportMicrosoft(text = '', voice = '') {
  return new Promise(res => {
    say.export(text, voice, 1, 'tts.wav', err => {
      if (err) {
        console.log(err)
      }

      res()
    })
  })
}

// fetches audio from the tiktop tts api
async function exportTikTok(text = '', voice = '') {
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
    fs.writeFileSync(join(dirname(__dirname), 'tts.wav'), Buffer.from(fetchedData.data, 'base64'))
  }
  catch (err) {
    console.log("Invalid message format, Buffer only takes in string")
  }
}

async function exportSAPI(text = '', voice = '') {
  const requestedData = await fetch(`https://www.tetyys.com/SAPI4/SAPI4?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voice)}`)

  const fetchedData = await requestedData.arrayBuffer()

  try {
    fs.writeFileSync(join(dirname(__dirname), 'tts.wav'), Buffer.from(fetchedData, 'base64'))
  }
  catch (err) {
    console.log("Invalid message format, Buffer only takes in string")
  }
}

module.exports = exportAudio
