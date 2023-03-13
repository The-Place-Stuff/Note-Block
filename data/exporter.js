const say = require('say')

function exportAudio(text = "", voice = "") {
    say.export(text, voice, 1, 'tts.wav', (err) => {
        if (err) {
            console.log(err)
        }
    })
}

module.exports = exportAudio