const socketIo = require('socket.io')
const config = require('config')
const statusOptions = config.get('status')
const Scheduler = require('../utilities/Scheduler')

class SocketServer {
  constructor({ server, client, logger }) {
    this._io = socketIo(server)
    this._scheduler = new Scheduler({ ...statusOptions, logger })
    this._client = client
    this._sockets = []
    this._logger = (message) => {
      if (!logger) return
      logger(message)
    }
  }

  broadcast(event, payload) {
    if (this.hasConnections) {
      this._io.emit(event, payload)
    }
  }

  get hasConnections() {
    return this._sockets.length
  }

  async start() {
    if (this._scheduler.isStarted) return
    this._logger('Started Socket.io status server')

    this._sockets = []
    this._io.on('connection', (socket) => {
      this._logger('Client connected')
      this._sockets.push(socket)
      socket.on('disconnect', () => {
        this._logger('Client disconnected')
        const idx = this._sockets.indexOf(socket)
        if (idx !== -1) this._sockets.splice(idx, 1);
      })
    })

    await this._scheduler.run(async () => {
      if (this.hasConnections) {
        const status = await this._client.getGrillStatus()
        this._logger(`Sending [${this._sockets.length}] client(s) status -> ${JSON.stringify(status, null, 2)}`)
        this.broadcast('status', status)
      } else this._logger('Waiting for connections...')
    }, this)

    this._sockets.forEach(socket => socket.close())
  }

  async stop() {
    await this._scheduler.stop()
  }
}

module.exports = SocketServer