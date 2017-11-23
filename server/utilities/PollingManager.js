const util = require('util')
const setTimeoutPromise = util.promisify(setTimeout)
const EventEmitter = require('events')

class PollingClient extends EventEmitter {
    constructor({ pollingInterval = 1000, tries = 5, logger } = {}) {
        super()
        this._polling = false
        this._tries = tries
        this._pollingInterval = pollingInterval
        this._logger = (message) => {
            if (!logger) return
            logger(message)
        }

        this.invokeWithRetry = this.invokeWithRetry.bind(this)
        this.start = this.start.bind(this)
        this.stop = this.stop.bind(this)
    }

    get isPolling() {
        return this._polling
    }

    async invokeWithRetry(task, context, { tries = this._tries } = {}) {
        if (!task || typeof task !== 'function') {
            throw new Error('Task must be a function')
        }

        let tryCount = 0
        const promise = Promise.resolve().then(() => task.call(context))
        while (true) {
            try {
                tryCount++
                this._logger(`Polling Manager invoking task -> Attempt #${tryCount}`)
                var result = await promise
                this.emit('polled', result)
                return result
            } catch (err) {
                this._logger(`Polling Manager invocation failed -> ${err}`)
                if (tryCount > tries) throw err
            }
        }
    }

    async start({ task, context, callback, runCondition, runCount, tries = this._tries } = {}) {
        if (task && typeof task !== 'function') {
            throw new Error('Task must be a function')
        }
        if (callback && typeof callback !== 'function') {
            throw new Error('Callback must be a function')
        }
        if (runCondition && typeof runCondition !== 'function') {
            throw new Error('Run Condition must be a function')
        }
        if (runCount && typeof runCount !== 'number') {
            throw new Error('Run Count must be a number')
        }

        // Run the schedule
        let counter = 0
        let shouldRun = true
        this._polling = true
        this.emit('started')
        this._logger('Polling Manager polling')
        while (this._polling && shouldRun) {

            // Execute the task
            counter++
            await setTimeoutPromise(this._pollingInterval)
            if (task) {
                try {
                    const result = await this.invokeWithRetry(task, context, { tries })
                    if (callback) callback(result)
                } catch (err) {
                    if (callback) callback(err)
                }
            }

            // Check if we should Exit Early
            if (runCondition && !runCondition()) {
                shouldRun = false
            } else if (runCount && runCount >= counter) {
                shouldRun = false
            }
        }
    }

    async stop() {
        await Promise.resolve().then(() => {
            this._polling = false
            this.emit('stopped')
            this._logger('Polling Manager stopped')
        })
    }
}

module.exports = PollingClient