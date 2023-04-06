const say = require('say')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
const fs = require('fs')
const http = require('https')
const path = require("path")


// evaluate which type of audio to export from
async function exportAudio(text = '', voice = '', voiceType) {
  if (voiceType == "tiktok") {
    await exportTikTok(text, voice)
  }
  else if (voiceType == "sapi") {
    await exportSAPI(text, voice)
  }
  else if (voiceType == "uberduck") {
    await exportQuack(text, voice)
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
    fs.writeFileSync(path.join(path.dirname(__dirname), 'tts.wav'), Buffer.from(fetchedData.data, 'base64'))
  }
  catch (err) {
    console.log("Invalid message format, Buffer only takes in string")
  }
}

async function exportSAPI(text = '', voice = '') {
  const requestedData = await fetch(`https://www.tetyys.com/SAPI4/SAPI4?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voice)}`)

  const fetchedData = await requestedData.arrayBuffer()

  try {
    fs.writeFileSync(path.join(path.dirname(__dirname), 'tts.wav'), Buffer.from(fetchedData, 'base64'))
  }
  catch (err) {
    console.log("Invalid message format, Buffer only takes in string")
  }
}

async function exportQuack(text = '', voice = '') {
  return new Promise(async (resolve, reject) => {
    const generateResponse = await fetch('https://api.uberduck.ai/speak', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'uberduck-id': 'anonymous',
        'Content-Type': 'application/json',
        Authorization: 'Basic cHViX2ZjZWdqcXJocXZreWpjd2VwdDpwa19iMjYyMzI3MC02YTFjLTQ1M2QtYjI3Mi1iODRiYmI5YTVmNDg=',
      },
      body: JSON.stringify({ voice, pace: 1, speech: text }),
    })
    const generatedData = await generateResponse.json()

    let filePath = null
    while (!filePath) {
      await new Promise(r => setTimeout(r, 100))
      const requestedData = await fetch(`http://api.uberduck.ai/speak-status?uuid=${generatedData.uuid}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })
      const fetchedData = await requestedData.json()

      filePath = fetchedData.path
    }

    const file = fs.createWriteStream('tts.wav')
    
    http.get(filePath, function (response) {
      response.pipe(file)

      file.on('finish', () => {
        file.close()
        resolve()
      })
    })
  })
}

module.exports = exportAudio
