const Scheduler = require('../utilities/Scheduler')
const config = require('config')
const alertOptions = config.get('alerts')

class AlertManager {
    constructor({ handlers, senders, client, logger }) {
        this._scheduler = new Scheduler({ ...alertOptions, logger })
        this._client = client
        this._handlers = handlers
        this._senders = senders
        this._logger = (message) => {
            if (!logger) return
            logger(message)
        }
    }

    async start() {
        await this._scheduler.run(async () => {
            // Get current grill status
            this._logger('Fetching grill status')
            const status = await this._client.getGrillStatus()
            const handlerNames = this._handlers.map(x => x.name).join(', ')

            // Convert handlers to async calls
            this._logger(`Executing alert handlers: ${handlerNames}`)
            const asyncHandlers = this._handlers
                .map(h => Promise.resolve().then(() => h.handle.call(h, status)))

            // Get Results requiring alerts
            const results = await Promise.all(asyncHandlers)
            const alerts = results.filter(x => x.triggered)
            const alertTypes = alerts.map(x => x.type).join()
            if (!alertTypes) return

            // Convert senders to async calls
            const senderNames = this._senders.map(x => x.name).join()
            const asyncSenders = alerts
                .map(alert => this._senders.map(s => Promise.resolve().then(() => s.send.call(s, alert))))
                .reduce((all, current) => current.concat(...all), [])

            // Send Alerts to all alert senders
            this._logger(`Sending alert for: [${alertTypes}] with senders: [${senderNames}]`)
            await Promise.all(asyncSenders)
        }, this)
    }

    async stop() {
        await this._scheduler.stop()
    }
}

module.exports = AlertManager