const say = require('say')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
const fs = require('fs')
import { dirname, join } from 'path'


// evaluate whether voice is tiktok or not
async function exportAudio(text = '', voice = '', isTikTok = false) {
  if (isTikTok) {
    await exportTikTok(text, voice)
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

  // TikTok voices don't like emojis very much, there could be a much better solution.
  try {
    fs.writeFileSync(join(dirname(__dirname), 'tts.wav'), Buffer.from(fetchedData.data, 'base64'))
  }
  catch (err) {
    console.log("Invalid message format, Buffer only takes in string")
  }
}

module.exports = exportAudio
