const socketIo = require('socket.io')
const debug = require('debug')('src:server')
const gmg = require('GMGClient')
const client = new gmg.GMGClient()
let connections = 0

module.exports.start = (server) => {
  const io = socketIo(server)
  debug('Started Socket.io server')

  io.on('connection', mainSocket => {
    debug('Client connecting...')
    connections++

    const schedule = setInterval(async () => {
      if (connections == 0) {
        clearInterval(schedule)
      }
      else {
        const status = await client.getGrillStatus()
        io.emit('status', status)
        debug(`Sending client status -> ${JSON.stringify(status)}`)
      }
    }, 5000)

    mainSocket.on('disconnect', () => {
      debug(`client disconnected`)
      connections--
    })
  })
}