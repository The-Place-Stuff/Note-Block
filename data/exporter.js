
const say = require('say')

function exportAudio(text = "") {
    say.export(text, 'Microsoft David Desktop', 1, 'tt.wav', (err) => {
        if (err) {
            console.log(err)
        }
    })
}

module.exports = exportAudio