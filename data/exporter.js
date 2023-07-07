const say = require('say')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
const fs = require('fs')
const https = require('https')
const path = require("path")

// evaluate which type of audio to export from
async function exportAudio(text = '', voice = '', exporter = '') {
  if (exporter == 'MICROSOFT') {
    await exportMicrosoft(text, voice)
    return
  }
  if (exporter == 'TIKTOK') {
    await exportTikTok(text, voice)
    return
  }
  if (exporter == 'UBERDUCK') {
    await exportQuack(text, voice)
    return
  }
  if (exporter == 'SAPI') {
    await exportSAPI(text, voice)
    return
  }
  if (exporter == 'STREAMLABS') {
    await exportStreamlabs(text, voice)
    return
  }
}

//
// Exports audio using Microsoft's built-in voices
//
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

//
// Exports audio using Tiktok's API
//
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

//
// Exports audio using Sam API
//
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

//
// Export audio using Uberduck's API
//
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
    try {
      https.get(filePath, function (response) {
        response.pipe(file)
  
        file.on('finish', () => {
          file.close()
          resolve()
        })
      })
    }
    catch (err) {
      console.log(err)
      reject()
    }
  })
}
 
async function exportStreamlabs(text = '', voice = '') {
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

  return new Promise(async (resolve, reject) => {
    try {
      https.get(fetchedData.speak_url, (res) => {
        const file = fs.createWriteStream(path.join(path.dirname(__dirname), 'tts.wav'))
        res.pipe(file)
        file.on('finish', () => {
          file.close()
          resolve()
        })
      })
    }
    catch (err) {
      console.log(err)
      reject()
    }
  })
}

module.exports = exportAudio
