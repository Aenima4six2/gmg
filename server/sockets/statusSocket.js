const socketIo = require('socket.io')
const debug = require('debug')('src:server')
const gmg = require('GMGClient')
const config = require('config')
const options = config.get('grill')
const client = new gmg.GMGClient({ ...options, logger: debug })

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
        const message = { ...status }
        Object.keys(message).filter(x => x.startsWith('_')).forEach(x => delete message[x])
        debug(`Sending [${connections}] client(s) status -> ${JSON.stringify(message, null, 2)}`)
      }
    }
  }

  schedule(controller)
}