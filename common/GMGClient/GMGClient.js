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
      const socket = dgram.createSocket('udp4')
      socket.bind(() => {
        socket.setBroadcast(true)
        const data = getCommandData(commands.getGrillStatus)
        const schedule = setInterval(() => {
          socket.send(data, 0, data.byteLength, this.port, this.host, error => {
            if (error) rej(error)
            else {
              socket.on('message', (msg, info) => {
                const hostIp = ip.address()
                if (info.address == hostIp) return
                clearInterval(schedule)
                this.host = info.address
                res(info.address)
              })
            }
          })
        }, retryMs)
      })
    })
  }

  async sendCommand(command) {
    if (this.host === defaultHost) await this.discoverGrill()
    return await new Promise((res, rej) => {
      const data = getCommandData(command)
      const socket = dgram.createSocket('udp4')
      const offset = data.byteLength
      const finish = (result, schedule) => {
        clearInterval(schedule)
        socket.removeAllListeners('message')
        result instanceof Error ? rej(result) : res(result)
      }

      let tries = 0
      const schedule = setInterval(() => {
        if (tries++ > this.tries) {
          finish(new Error('Try count exceeded!'), schedule)
        }
        else {
          socket.send(data, 0, offset, this.port, this.host, error => {
            if (error) finish(error, schedule)
          })
        }
      }, retryMs)

      socket.on('message', (msg, info) => {
        if (info.address !== ip.address())
          finish({ msg, info }, schedule)
      })
    })
  }

}

module.exports = GMGClient