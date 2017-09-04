const socketIo = require('socket.io')
const debug = require('debug')('src:server')
const gmg = require('GMGClient')
const client = new gmg.GMGClient({ logger: debug })

function schedule(scheduled) {
  if (scheduled.enabled)
    setTimeout(async () => {
      if (scheduled.enabled) {
        try {
          await scheduled.task()
        }
        catch (ex) {
          debug(ex.message)
          if (!scheduled.continueOnError) return
        }
        schedule(scheduled)
      }
    }, scheduled.interval)
}

let connections = 0
let controller = {}
module.exports.stop = () => {
  if (controller.enabled) {
    controller.enabled = false
  }
}

module.exports.start = (server) => {
  const io = socketIo(server)
  debug('Started Socket.io server')

  io.on('connection', (socket) => {
    debug('Client connected')
    connections++
    socket.on('disconnect', () => {
      debug(`Client disconnected`)
      connections--
    })
  })

  controller = {
    continueOnError: true,
    enabled: true,
    interval: 5000,
    task: async () => {
      if (connections <= 0) debug('Waiting for connections...')
      else {
        debug('Fetching grill status...')
        const status = await client.getGrillStatus()
        io.emit('status', status)
        debug(`Sending [${connections}] client(s) status -> ${JSON.stringify(status)}`)
      }
    }
  }

  schedule(controller)
}