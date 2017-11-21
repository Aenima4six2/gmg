const config = require('config')
const PollingManager = require('../utilities/PollingManager')
const EventEmitter = require('events')

class PollingClient extends EventEmitter {
    constructor({ client, logger, options = config.get('status') }) {
        super()
        this._pollingManager = new PollingManager({ ...options, logger })
        this._client = client
        this._logger = (message) => {
            if (!logger) return
            logger(message)
        }

        this.start = this.start.bind(this)
        this.stop = this.stop.bind(this)
    }

    async start() {
        await this._pollingManager.start({
            task: async () => {
                // Get current grill status
                this._logger('Fetching grill status')
                const status = await this._client.getGrillStatus()
                this.emit('status', status)
            },
            context: this
        })
    }

    async stop() {
        await this._pollingManager.stop()
    }
}

module.exports = PollingClient