const socketIo = require('socket.io')
const gmg = require('GMGClient')
const config = require('config')
const grillOptions = config.get('grill')
const statusOptions = config.get('status')
const Scheduler = require('../utilities/Scheduler')

class SocketServer {
  constructor({ server, logger }) {
    this._io = socketIo(server)
    this._scheduler = new Scheduler({ ...statusOptions, logger })
    this._client = new gmg.GMGClient({ ...grillOptions, logger })
    this._logger = (message) => {
      if (!logger) return
      logger(message)
    }
  }

  broadcast(event, payload) {
    this._io.emit(event, payload)
  }

  async start() {
    if (this._scheduler.isStarted) return
    this._logger('Started Socket.io status server')

    let sockets = []
    this._io.on('connection', (socket) => {
      this._logger('Client connected')
      sockets.push(socket)
      socket.on('disconnect', () => {
        this._logger('Client disconnected')
        const idx = sockets.indexOf(socket)
        if (idx !== -1) sockets.splice(idx, 1);
      })
    })

    await this._scheduler.start(async () => {
      if (sockets.length <= 0) this._logger('Waiting for connections...')
      else {
        const status = await this._client.getGrillStatus()
        this._logger(`Sending [${sockets.length}] client(s) status -> ${JSON.stringify(status, null, 2)}`)
        this.broadcast('status', status)
      }
    }, this)

    sockets.forEach(socket => socket.close())
  }

  async stop() {
    await this._scheduler.stop()
  }
}

module.exports = SocketServer