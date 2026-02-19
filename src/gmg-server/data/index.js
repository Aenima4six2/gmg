const { open } = require('sqlite')
const sqlite3 = require('sqlite3')
const Path = require('path')

let db

module.exports.initialize = ({ logger }) => {
  const db_path = Path.join(__dirname, './grill_data.db')
  logger('Initializing db: [%s]', db_path)
  db = open({
    filename: db_path,
    driver: sqlite3.Database
  })
}

module.exports.createDb = async () => db
