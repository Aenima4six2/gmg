const socketIo = require('socket.io')

class SocketServer {
  constructor({ server, logger, pollingClient }) {
    this._io = socketIo(server)
    this._pollingClient = pollingClient
    this._sockets = []
    this._started = false
    this._logger = (message) => {
      if (!logger) return
      logger(message)
    }

    this.broadcast = this.broadcast.bind(this)
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this._onConnection = this._onConnection.bind(this)
    this._onStatus = this._onStatus.bind(this)
  }

  get connections() {
    return this._sockets.length
  }

  broadcast(event, payload) {
    if (this.connections) {
      const json = JSON.stringify(payload, null, 2)
      this._logger(`Sending [${this.connections}] client(s) broadcast payload -> ${json}`)
      this._io.emit(event, payload)
    } else this._logger('Waiting for connections...')
  }

  start() {
    if (this._started) throw new Error('Already started!')
    this._started = true
    this._logger('Starting Socket Manager...')
    this._sockets = []
    this._pollingClient.on('status', this._onStatus)
    this._io.on('connection', this._onConnection)
    this._logger('Socket Manager started!')
  }

  stop() {
    if (!this._started) throw new Error('Already stopped!')
    this._started = false
    this._sockets.forEach(socket => socket.close())
    this._pollingClient.removeListener('status', this._onStatus)
    this._io.removeListener('connection', this._onConnection)
  }

  _onConnection(socket) {
    this._logger('Client connected')
    this._sockets.push(socket)
    socket.on('disconnect', () => {
      this._logger('Client disconnected')
      const idx = this._sockets.indexOf(socket)
      if (idx !== -1) this._sockets.splice(idx, 1);
    })
  }

  _onStatus(status) {
    this.broadcast('status', status)
  }
}

module.exports = SocketServer