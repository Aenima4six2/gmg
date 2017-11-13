const util = require('util')
const setTimeoutPromise = util.promisify(setTimeout)

class Scheduler {
    constructor({ pollingInterval = 1000, tries = 5, logger } = {}) {
        this._started = false
        this._tries = tries
        this._pollingInterval = pollingInterval
        this._logger = (message) => {
            if (!logger) return
            logger(message)
        }
    }

    get isStarted() {
        return this._started
    }

    async invokeWithRetry(task, context) {
        let tryCount = 0
        const promise = Promise.resolve().then(() => task.call(context))
        while (true) {
            try {
                tryCount++
                this._logger(`Scheduler invoking task -> Attempt #${tryCount}`)
                return await promise
            } catch (err) {
                this._logger(`Scheduler invocation failed -> ${err}`)
                if (tryCount > this.tries) throw err
            }
        }
    }

    async run(task, context, { runCondition, runCount } = {}) {
        if (!task || typeof task !== 'function') {
            throw new Error('Task must be a function')
        }
        if (runCondition && typeof runCondition !== 'function') {
            throw new Error('runCondition must be a function')
        }
        if (runCount && typeof runCount !== 'number') {
            throw new Error('runCount must be a number')
        }

        // Run the schedule
        let counter = 0
        let shouldRun = true
        this._logger('Scheduler started')
        this._started = true
        while (this._started && shouldRun) {

            // Execute the task
            counter++
            await setTimeoutPromise(this._pollingInterval)
            await this.invokeWithRetry(task, context)

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
            this._logger('Scheduler stopped')
            this._started = false
        })
    }
}

module.exports = Scheduler