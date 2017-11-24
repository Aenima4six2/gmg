const defaults = require('./defaultOptions')
const dgram = require('dgram')
const ip = require('ip')
const GrillStatus = require('./GrillStatus')
const InvalidCommand = require('./InvalidCommand')
const commands = Object.freeze({
  powerOn: 'UK001',
  powerOff: 'UK004',
  getGrillStatus: 'UR001',
  setGrillTempF: (temp) => `UT${temp}`,
  setFoodTempF: (temp) => `UF${temp}`
})

const results = Object.freeze({
  OK: 'OK'
})

const getCommandData = (command) => {
  const fullCommand = `${command}!\n`
  const data = Buffer.from(fullCommand, 'ascii')
  return data
}

class GMGClient {
  constructor({
    port = defaults.port,
    host = defaults.host,
    tries = defaults.tries,
    retryMs = defaults.retryMs,
    logger
  } = {}) {
    this.port = port
    this.host = host
    this.tries = tries
    this.retryMs = retryMs
    this._logger = (message) => {
      if (!logger) return
      logger(message)
    }
  }

  async getGrillStatus() {
    const result = await this.sendCommand(commands.getGrillStatus)
    return new GrillStatus(result.msg)
  }

  async powerToggleGrill() {
    let status = await this.getGrillStatus()
    if (status.isOn) {
      await this._powerOffGrill(status)
    } else {
      await this._powerOnGrill(status)
    }
  }

  async powerOffGrill() {
    let status = await this.getGrillStatus()
    await this._powerOffGrill(status)
  }

  async powerOnGrill() {
    let status = await this.getGrillStatus()
    await this._powerOnGrill(status)
  }

  async setGrillTemp(fahrenheit) {
    let status = await this.getGrillStatus()
    if (!status.isOn) {
      const error = new InvalidCommand('Cannot set grill temperature when the gill is off!')
      this._logger(error)
      throw error
    }

    const command = commands.setGrillTempF(fahrenheit)
    const result = await this.sendCommand(command)
    await this._validateResult(result, newState => newState.desiredGrillTemp === fahrenheit)
  }

  async setFoodTemp(fahrenheit) {
    let status = await this.getGrillStatus()
    if (!status.isOn) {
      const error = new InvalidCommand('Cannot set food temperature when the gill is off!')
      this._logger(error)
      throw error
    }

    const command = commands.setFoodTempF(fahrenheit)
    const result = await this.sendCommand(command)
    await this._validateResult(result, newState => newState.desiredFoodTemp === fahrenheit)
  }

  async discoverGrill({ tries = this.tries } = {}) {
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
          const self = ip.address()
          if (info.address !== self) {
            this.host = info.address
            finish(this.host)
            this._logger(`Received discovery response dgram from Grill (${info.address}:${info.port})`)
          }
        })

        // Send Commands
        this._logger('Attempting grill discovery...')
        schedule = setInterval(() => {
          if (attempts >= tries) {
            const error = new Error(
              `No response from Grill (${this.host}:${this.port}) after [${attempts}] discovery attempts!`)
            finish(error)
            this._logger(error)
          } else {
            attempts++
            socket.send(data, 0, data.byteLength, this.port, this.host, error => {
              if (error) {
                this._logger(`Grill (${this.host}:${this.port}) discovery broadcast dgram send failed -> ${error}`)
              } else {
                this._logger(`Grill (${this.host}:${this.port}) discovery broadcast dgram sent -> Attempt #${attempts}`)
              }
            })
          }
        }, this.retryMs)
      })
    })
  }

  async sendCommand(command, { tries = this.tries } = {}) {
    if (this.host === defaults.host) {
      this._logger('Grill host is broadcast address!')
      await this.discoverGrill()
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
        if (info.address === this.host) {
          finish({ msg, info })
          this._logger(`Received response dgram from Grill (${info.address}:${info.port})`)
        }
      })

      // Send Commands
      schedule = setInterval(() => {
        if (attempts > tries) {
          const error = new Error(`No response from Grill after [${attempts}] command sent attempts!`)
          finish(error)
          this._logger(error)
        } else {
          attempts++
          socket.send(data, 0, offset, this.port, this.host, error => {
            if (error) {
              this._logger(`Grill (${this.host}:${this.port}) [${command}] command dgram send failed -> ${error}`)
            } else {
              this._logger(`Grill (${this.host}:${this.port}) [${command}] command dgram sent -> Attempt #${attempts}.`)
            }
          })
        }
      }, this.retryMs)
    })
  }


  async _powerOffGrill(status) {
    if (!status.isOn) return
    const result = await this.sendCommand(commands.powerOff)
    await this._validateResult(result, newState => !newState.isOn)
  }

  async _powerOnGrill(status) {
    if (status.fanModeActive) {
      const error = new InvalidCommand('Cannot start grill when fan mode is active.')
      this._logger(error)
      throw error
    }

    const result = await this.sendCommand(commands.powerOn)
    await this._validateResult(result, newState => newState.isOn)
  }

  async _validateResult(result, validator) {
    const response = result.msg.toString()
    if (response !== results.OK) {
      throw new Error(`Grill responded with non OK status -> ${response}`)
    }
  }

}

module.exports = GMGClient