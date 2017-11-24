class AlertManager {
    constructor({ handlers, senders, pollingClient, logger }) {
        this._pollingClient = pollingClient
        this._handlers = handlers
        this._senders = senders
        this._started = false
        this._logger = (message) => {
            if (!logger) return
            logger(message)
        }

        this.sendAlerts = this.sendAlerts.bind(this)
        this.start = this.start.bind(this)
        this.stop = this.stop.bind(this)
        this._onStatus = this._onStatus.bind(this)
    }

    async sendAlerts(status) {
        try {
            // Convert handlers to async calls
            const handlerNames = this._handlers.map(x => x.name).join(', ')
            this._logger(`Executing alert handlers: [${handlerNames}]`)
            const asyncHandlers = this._handlers.map(handler => Promise.resolve().then(() => {
                return handler.handle.call(handler, status)
            }))

            // Get Results requiring alerts
            const handlerResults = await Promise.all(asyncHandlers)
            const triggeredHandlersResults = handlerResults.filter(x => x.triggered)
            if (!triggeredHandlersResults.length) return

            // Convert senders to async calls
            const alerts = triggeredHandlersResults
                .map(handlerResult => handlerResult.createAlert())
            const asyncSenders = alerts
                .map(alert => this._senders.map(sender => Promise.resolve().then(() => {
                    return sender.send.call(sender, alert)
                })))
                .reduce((all, current) => current.concat(...all), [])

            // Send Alerts to all alert senders
            const senderNames = this._senders.map(x => x.name).join(', ')
            const alertTypes = alerts.map(x => x.type).join()
            this._logger(`Sending alert for: [${alertTypes}] with senders: [${senderNames}]`)
            await Promise.all(asyncSenders)
        } catch (err) {
            this._logger(`Sending alert failed -> ${err}`)
        }
    }

    start() {
        if (this._started) throw new Error('Already started!')
        this._started = true
        this._logger('Starting Alert Manager...')
        this._pollingClient.on('status', this._onStatus)
    }

    stop() {
        if (!this._started) throw new Error('Already stopped!')
        this._started = false
        this._pollingClient.removeListener('status', this._onStatus)
    }

    _onStatus(status) {
        this.sendAlerts(status)
    }
}

module.exports = AlertManager