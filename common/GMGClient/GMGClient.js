const defaultPort = 8080
const defaultHost = '255.255.255.255'
const dgram = require('dgram')
const retryMs = 500
const ip = require('ip')
const GrillStatus = require('./GrillStatus')
const InvalidCommand = require('./InvalidCommand')

const commands = Object.freeze({
  powerOn: 'UK001',
  powerOff: 'UK004',
  getGrillStatus: 'UR001',
  setGrillTempF: (temp) => `UR${temp}`,
  setFoodTempF: (temp) => `UF${temp}`
})

const getCommandData = (command) => {
  const fullCommand = `${command}!\n`
  const data = Buffer.from(fullCommand, 'ascii')
  return data
}

class GMGClient {
  constructor(port = defaultPort, host = defaultHost, tries = 5) {
    this.port = port
    this.host = host
    this.tries = tries
  }

  async getGrillStatus() {
    const result = await this.sendCommand(commands.getGrillStatus)
    return new GrillStatus(result.msg)
  }

  async powerOffGrill() {
    const status = await this.getGrillStatus()
    if (!status.isOn) return

    const result = await this.sendCommand(commands.powerOff)
    const response = result.msg.toString()
    return response == 'OK' ? Promise.resolve() : Promise.reject()
  }

  async powerOnGrill() {
    const status = await this.getGrillStatus()
    if (status.fanModeActive) {
      throw new InvalidCommand('Cannot start grill when fan mode is active.')
    }

    const result = await this.sendCommand(commands.powerOn)
    const response = result.msg.toString()
    return response == 'OK' ? Promise.resolve() : Promise.reject()
  }

  async setGrillTemp(fahrenheit) {
    const status = await this.getGrillStatus()
    if (!status.isOn) {
      throw new InvalidCommand('Cannot set grill temperature when the gill is off!')
    }

    const result = await this.sendCommand(commands.setGrillTempF(fahrenheit))
    const response = result.msg.toString()
    return response == 'OK' ? Promise.resolve() : Promise.reject()
  }

  async setFoodTemp(fahrenheit) {
    const status = await this.getGrillStatus()
    if (!status.isOn) {
      throw new InvalidCommand('Cannot set food temperature when the gill is off!')
    }

    const result = await this.sendCommand(commands.setFoodTempF(fahrenheit))
    const response = result.msg.toString()
    return response == 'OK' ? Promise.resolve() : Promise.reject()
  }

  async discoverGrill() {
    return new Promise((res, rej) => {
      let attempt = 0, schedule
      const socket = dgram.createSocket('udp4')
      const data = getCommandData(commands.getGrillStatus)
      socket.bind(() => {
        // Enable UDP broadcast
        socket.setBroadcast(true)

        // Listen for response
        socket.on('message', (msg, info) => {
          if (info.address !== ip.address()) {
            if (schedule) clearInterval(schedule)
            socket.removeAllListeners('message')
            socket.close()
            res(info.address)
          }
        })

        // Send Commands
        schedule = setInterval(() => {
          if (attempt++ >= this.tries) {
            rej(new Error(`No response from Grill after [${attempt}] discovery attempts!`))
          }
          else {
            socket.send(data, 0, data.byteLength, this.port, this.host, error => {
              if (error) rej(error)
            })
          }
        }, retryMs)
      })
    })
  }

  async sendCommand(command) {
    if (this.host === defaultHost) {
      const newHost = await this.discoverGrill()
      this.host = newHost
    }

    return await new Promise((res, rej) => {
      let attempts = 0, schedule
      const data = getCommandData(command)
      const socket = dgram.createSocket('udp4')
      const offset = data.byteLength
      const finish = (result) => {
        if (schedule) clearInterval(schedule)
        socket.removeAllListeners('message')
        socket.close()
        result instanceof Error ? rej(result) : res(result)
      }

      // Listen for response
      socket.on('message', (msg, info) => {
        if (info.address !== ip.address())
          finish({ msg, info })
      })

      // Send Commands
      schedule = setInterval(() => {
        if (attempts++ > this.tries) {
          finish(new Error('Try count exceeded!'))
        }
        else {
          socket.send(data, 0, offset, this.port, this.host, error => {
            if (error) finish(error)
          })
        }
      }, retryMs)
    })
  }
}

module.exports = GMGClient