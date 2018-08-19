const SQLite = require('sqlite3')
const Path = require('path')

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

    start() {
        if (this._started) throw new Error('Already started!')
        this._started = true

        this.db = new SQLite.Database(Path.join(__dirname, './grill_data.db'))

        this.db.run(`
            CREATE TABLE temperature_log (
                temperature_log_id INTEGER PRIMARY KEY,
                timestamp integer UNIQUE,
                grill_temperature integer(2) NOT NULL,
                food_temperature integer(2) NULL
            );
        `)

        this._logger('Starting Persistence Manager...')
        this._pollingClient.on('status', this._onStatus)
    }

    stop() {
        if (!this._started) throw new Error('Already stopped!')
        this._started = false
        this._pollingClient.removeListener('status', this._onStatus)
        this.db.close()
    }

    _onStatus(status) {
        const insert_statement = this.db.prepare(`
            INSERT INTO temperature_log (timestamp, grill_temperature, food_temperature)
            VALUES (strftime('%s','now'), ?, ?)
        `)

        insert_statement.run(status.currentGrillTemp, status.currentFoodTemp)

        insert_statement.finalize()
    }
}

module.exports = PersistenceManager