const fs = require('fs')
const path = require('path')
const dbFactory = require('./index')

const CLEANUP_CHECK_INTERVAL = 100

class PersistenceManager {
    constructor({ pollingClient, logger, dbPath, maxSizeMb }) {
        this._pollingClient = pollingClient
        this._logger = (message) => {
            if (!logger) return
            logger(message)
        }
        this._dbPath = dbPath || path.join(__dirname, 'grill_data.db')
        this._maxSizeBytes = (maxSizeMb || 50) * 1024 * 1024
        this._insertCount = 0

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
            $food_temperature: status.currentFoodTemp
        })

        this._insertCount++
        if (this._insertCount % CLEANUP_CHECK_INTERVAL === 0) {
            await this._cleanup()
        }
    }

    async _cleanup() {
        let fileSize
        try {
            fileSize = fs.statSync(this._dbPath).size
        } catch {
            return
        }

        if (fileSize <= this._maxSizeBytes) return

        this._logger(`DB size ${(fileSize / 1024 / 1024).toFixed(1)}MB exceeds limit ${(this._maxSizeBytes / 1024 / 1024).toFixed(0)}MB, cleaning up...`)

        const { count } = await this.db.get('SELECT COUNT(*) as count FROM temperature_log')
        const deleteCount = Math.ceil(count * 0.1)

        await this.db.run(`
            DELETE FROM temperature_log WHERE temperature_log_id IN (
                SELECT temperature_log_id FROM temperature_log
                ORDER BY timestamp ASC LIMIT ?
            )
        `, deleteCount)

        await this.db.run('VACUUM')
        this._logger(`Deleted ${deleteCount} oldest rows, VACUUMed database`)
    }
}

module.exports = PersistenceManager
