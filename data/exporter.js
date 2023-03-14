const say = require('say')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
const fs = require('fs')
import { dirname, join } from 'path'

function exportAudio(text = '', voice = '') {
  return new Promise(res => {
    say.export(text, voice, 1, 'tts.wav', err => {
      if (err) {
        console.log(err)
      }

      res()
    })
  })
}

async function exportTikTokAudio(text = '', voice = '') {
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

module.exports = {
  exportAudio,
  exportTikTokAudio
}
