const defaultPort = 8080
const defaultHost = '255.255.255.255'
const dgram = require('dgram')
const retryMs = 1000
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
  constructor({ port = defaultPort, host = defaultHost, tries = 5, logger = null } = {}) {
    this.port = port
    this.host = host
    this.tries = tries
    this.logger = (message) => {
      if (!logger) return
      logger(message)
    }
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
      const error = new InvalidCommand('Cannot start grill when fan mode is active.')
      this.logger(error)
      throw error
    }

    const result = await this.sendCommand(commands.powerOn)
    const response = result.msg.toString()
    return response == 'OK' ? Promise.resolve() : Promise.reject()
  }

  async setGrillTemp(fahrenheit) {
    const status = await this.getGrillStatus()
    if (!status.isOn) {
      const error = new InvalidCommand('Cannot set grill temperature when the gill is off!')
      this.logger(error)
      throw error
    }

    const result = await this.sendCommand(commands.setGrillTempF(fahrenheit))
    const response = result.msg.toString()
    return response == 'OK' ? Promise.resolve() : Promise.reject()
  }

  async setFoodTemp(fahrenheit) {
    const status = await this.getGrillStatus()
    if (!status.isOn) {
      const error = new InvalidCommand('Cannot set food temperature when the gill is off!')
      this.logger(error)
      throw error
    }

    const result = await this.sendCommand(commands.setFoodTempF(fahrenheit))
    const response = result.msg.toString()
    return response == 'OK' ? Promise.resolve() : Promise.reject()
  }

  async discoverGrill() {
    return new Promise((res, rej) => {
      let attempts = 0, schedule
      const socket = dgram.createSocket('udp4')
      const data = getCommandData(commands.getGrillStatus)
      const finish = (result) => {
        if (schedule) clearInterval(schedule)
        socket.removeAllListeners('message')
        socket.close()
        result instanceof Error ? rej(result) : res(result)
      }

      socket.bind(() => {
        // Listen for response
        socket.setBroadcast(true)
        socket.on('message', (msg, info) => {
          if (info.address !== ip.address()) {
            finish(info.address)
            this.logger(`Received response dgram from ${info.address}`)
          }
          else {
            this.logger(`Received response dgram from self (${info.address}) - ignoring`)
          }
        })

        // Send Commands
        schedule = setInterval(() => {
          if (attempts >= this.tries) {
            const error = new Error(`No response from Grill after [${attempts}] discovery attempts!`)
            finish(error)
            this.logger(error)
          }
          else {
            attempts++
            socket.send(data, 0, data.byteLength, this.port, this.host, error => {
              if (error) {
                finish(error)
                this.logger(`Grill discovery broadcast dgram send failed -> ${error}`)
              }
              else {
                this.logger(`Grill discovery broadcast dgram sent -> Attempt #${attempts}`)
              }
            })
          }
        }, retryMs)
      })
    })
  }

  async sendCommand(command) {
    if (this.host === defaultHost) {
      this.logger(`No grill host provided. Attempting discovery...`)
      const newHost = await this.discoverGrill()
      this.host = newHost
      this.logger(`Grill discovered at ${newHost}!`)
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
        if (info.address !== ip.address()) {
          finish({ msg, info })
          this.logger(`Received response dgram from ${info.address}`)
        }
        else {
          this.logger(`Received response dgram from self (${info.address}) - ignoring`)
        }
      })

      // Send Commands
      schedule = setInterval(() => {
        if (attempts > this.tries) {
          const error = new Error(`No response from Grill after [${attempt}] command sent attempts!`)
          finish(error)
          this.logger(error)
        }
        else {
          attempts++
          socket.send(data, 0, offset, this.port, this.host, error => {
            if (error) {
              finish(error)
              this.logger(`Grill [${command}] command dgram send failed -> ${error}`)
            }
            else {
              this.logger(`Grill [${command}] command dgram sent -> Attempt #${attempts}.`)
            }
          })
        }
      }, retryMs)
    })
  }
}

module.exports = GMGClient