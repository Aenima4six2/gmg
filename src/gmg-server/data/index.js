const { open } = require('sqlite')
const sqlite3 = require('sqlite3')
const Path = require('path')

let db

module.exports.initialize = ({ logger }) => {
  const dbDir = process.env.GMG_DB_PATH || __dirname
  const filename = Path.join(dbDir, 'grill_data.db')

  logger('Initializing db: [%s]', filename)

  db = open({
    filename,
    driver: sqlite3.Database
  }).catch(err => {
    logger("Failed to initialize db: %s", err)
    setImmediate(() => process.exit(1))
  })
}

module.exports.createDb = () => Promise.resolve(db)
