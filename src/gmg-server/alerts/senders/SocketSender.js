const path = require('path')

class SocketSender {
    constructor(socketManager, { audioEnabled = true } = {}) {
        if (!socketManager) throw new Error('Socket server required')
        this._socketManager = socketManager
        this._audioEnabled = audioEnabled

        this.send = this.send.bind(this)
    }

    get name() {
        return path.basename(__filename)
    }

    send(alert) {
        if (!alert) throw new Error('Alert required')
        if (this._audioEnabled) {
            this._socketManager.broadcast('alert', alert)
        } else {
            // Strip the sound so the browser shows the alert silently
            const { beep, ...silentAlert } = alert
            this._socketManager.broadcast('alert', silentAlert)
        }
    }
}

module.exports = SocketSender
