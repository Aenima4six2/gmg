const path = require('path')

class SocketSender {
    constructor(socketManager) {
        if (!socketManager) throw new Error('Socket server required')
        this._socketManager = socketManager

        this.send = this.send.bind(this)
    }

    get name() {
        return path.basename(__filename)
    }

    send(alert) {
        if (!alert) throw new Error('Alert required')
        this._socketManager.broadcast('alert', alert)
    }
}

module.exports = SocketSender