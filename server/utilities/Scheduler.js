const util = require('util')
const setTimeoutPromise = util.promisify(setTimeout)

class Scheduler {
    constructor({ pollingInterval = 1000, logger } = {}) {
        this._started = false
        this._pollingInterval = pollingInterval
        this._logger = (message) => {
            if (!logger) return
            logger(message)
        }
    }

    get isStarted() {
        return this._started
    }

    async start(task, context, onStopped) {
        if (!task || typeof task !== 'function') throw new Error('Task must be a function')
        if (onStopped && typeof task !== 'function') throw new Error('onStopped must be a function')
        if (this._started) return // exit if already started

        // Run until stopped
        this._logger('Scheduler started')
        this._started = true
        while (this._started) {
            this._logger(`Scheduler sleeping for [${this._pollingInterval}]`)
            await setTimeoutPromise(this._pollingInterval)
            this._logger('Scheduler invoking task')
            await Promise.resolve(task.call(context))
        }

        // Raise stopped callback
        if (onStopped) onStopped()
    }

    async stop() {
        await Promise.resolve().then(() => {
            this._logger('Scheduler stopped')
            this._started = false
        })
    }
}

module.exports = Scheduler