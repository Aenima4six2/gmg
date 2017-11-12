
const path = require('path')

class SocketSender {
    constructor(socketServer) {
        if (!socketServer) throw new Error('Socket server required')
        this._socketServer = socketServer
    }

    get name() {
        return path.basename(__filename)
    }

    send(alert) {
        if (!alert) throw new Error('Alert required')
        this._socketServer.broadcast('alert', alert)
    }
}

module.exports = SocketSender