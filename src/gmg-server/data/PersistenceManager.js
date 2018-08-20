const dbFactory = require('./index')

class PersistenceManager {
    constructor({ pollingClient, logger }) {
        this._pollingClient = pollingClient
        this._logger = (message) => {
            if (!logger) return
            logger(message)
        }

        this.start = this.start.bind(this)
        this.stop = this.stop.bind(this)
        this._onStatus = this._onStatus.bind(this)
    }

    async start() {
        if (this._started) throw new Error('Already started!')
        this._started = true

        this.db = await dbFactory.createDb()

        await this.db.run(`
            CREATE TABLE IF NOT EXISTS temperature_log (
                temperature_log_id integer PRIMARY KEY,
                timestamp integer UNIQUE,
                grill_temperature integer(2) NOT NULL,
                food_temperature integer(2) NULL
            );
        `)

        this._logger('Starting Persistence Manager...')
        this._pollingClient.on('status', this._onStatus)
    }

    async stop() {
        if (!this._started) throw new Error('Already stopped!')
        this._started = false
        this._pollingClient.removeListener('status', this._onStatus)
        await this.db.close()
    }

    async _onStatus(status) {
        if (!status.isOn) {
            return
        }

        await this.db.run(`
            INSERT INTO temperature_log (timestamp, grill_temperature, food_temperature)
            VALUES (strftime('%s','now'), $grill_temperature, $food_temperature)
        `, {
            $grill_temperature: status.currentGrillTemp,
            $food_temperature: status.currentFoodTemp,
        })
    }
}

module.exports = PersistenceManager