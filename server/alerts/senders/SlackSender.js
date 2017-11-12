
const path = require('path')

class SlackSender {
    constructor(io) {
        this._io = io
    }

    get name() {
        return path.basename(__filename)
    }

    send(alert) {
        this._io.emit('alert', alert)
    }
}

module.exports = SlackSender