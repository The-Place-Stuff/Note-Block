const say = require('say')

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

module.exports = exportAudio
