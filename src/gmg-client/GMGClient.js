const defaults = require('./defaultOptions')
const dgram = require('dgram')
const GrillStatus = require('./GrillStatus')
const InvalidCommand = require('./InvalidCommand')
const commands = Object.freeze({
  powerOn: 'UK001!',
  powerOff: 'UK004!',
  getGrillStatus: 'UR001!',
  getGrillId: 'UL!',
  init: 'UN!',
  setGrillTempF: (temp) => `UT${temp}!`,
  setFoodTempF: (temp) => `UF${temp}!`
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

  async initGrill() {
    this._logger("Sending init command...")
    await this.sendCommand(commands.init, { shouldRespond: false })
  }

  async getGrillId() {
    const result = await this.sendCommand(commands.getGrillId, { ignoreEmpty: true })
    return result.msg.toString()
  }

  async getGrillStatus() {
    const result = await this.sendCommand(commands.getGrillStatus, { ignoreEmpty: true })
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
    if (this.host.includes("255")) {
      this._logger(`Grilled host ${this.host} does not contain broadcast octet, skipping discovery...`)
      return
    }

    let attempts = 0, finished = false, schedule, socket
    const data = getCommandData(commands.getGrillId)

    try {
      await new Promise((res, rej) => {
        socket = dgram.createSocket('udp4')

        const finish = (result) => {
          finished = true
          if (schedule) clearInterval(schedule)
          if (result instanceof Error) rej(result)
          else res(result)
        }

        socket.bind(() => {
          socket.setBroadcast(true)

          // Listen for response
          socket.on('message', (msg, info) => {
            const msgStr = msg.toString('utf8')
            const meta = JSON.stringify({ msg: msgStr, info })
            this._logger(`Received response: ${meta}`)

            if (finished) return

            // Make sure the response is not a broadcast to ourself
            if (msgStr.trim() !== "" && !msg.equals(data)) {
              this.host = info.address
              this._logger(`Response is discovery dgram from Grill (${info.address}:${info.port})`)
              finish(this.host)
            }
          })

          const work = () => {
            if (finished) return

            this._logger('Attempting grill discovery...')
            if (attempts >= tries) {
              const error = new Error(`No response from Grill (${this.host}:${this.port}) after [${attempts}] discovery attempts!`)
              this._logger(error)
              return finish(error)
            }

            attempts++
            socket.send(data, 0, data.byteLength, this.port, this.host, error => {
              if (error) {
                this._logger(`Grill (${this.host}:${this.port}) discovery broadcast dgram send failed -> ${error}`)
              } else {
                this._logger(`Grill (${this.host}:${this.port}) discovery broadcast dgram sent -> Attempt #${attempts}`)
              }

              if (!schedule) schedule = setInterval(work, this.retryMs)
            })
          }

          work()
        })
      })
    } finally {
      socket?.removeAllListeners('message')
      socket?.close()
    }
  }

  async sendCommand(command, { tries = this.tries, shouldRespond = true, ignoreEmpty = false } = {}) {
    if (this.host === defaults.host) {
      throw new Error('Grill host is broadcast address! Please discover first')
    }

    let attempts = 0, finished = false, schedule, socket
    const data = getCommandData(command)

    try {
      return await new Promise((res, rej) => {
        socket = dgram.createSocket('udp4')
        const offset = data.byteLength

        const finish = (result) => {
          finished = true
          if (schedule) clearInterval(schedule)
          if (result instanceof Error) rej(result)
          else res(result)
        }

        // Listen for response
        if (shouldRespond) {
          socket.on('message', (msg, info) => {
            const msgStr = msg.toString('utf8')
            const isEmpty = msgStr.trim() === ""
            const meta = JSON.stringify({ msg: msgStr, info, isEmpty })
            this._logger(`Received response: ${meta}`)

            if (finished) return

            if ((!ignoreEmpty || !isEmpty) && info.address === this.host) {
              this._logger(`Received response dgram from Grill (${info.address}:${info.port})`)
              finish({ msg, info })
            }
          })
        }

        const work = () => {
          if (finished) return

          if (attempts > tries) {
            const error = new Error(`No response from Grill after [${attempts}] command sent attempts!`)
            this._logger(error)
            return finish(error)
          }

          attempts++
          socket.send(data, 0, offset, this.port, this.host, error => {
            if (error) {
              this._logger(`Grill (${this.host}:${this.port}) [${command}] command dgram send failed -> ${error}`)
            } else {
              this._logger(`Grill (${this.host}:${this.port}) [${command}] command dgram sent -> Attempt #${attempts}.`)
            }

            if (!shouldRespond) return finish()
            if (!schedule) schedule = setInterval(work, this.retryMs)
          })
        }

        work()
      })
    } finally {
      socket?.removeAllListeners('message')
      socket?.close()
    }
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