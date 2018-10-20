const SQLite = require('sqlite')
const Path = require('path')

let db

module.exports.initialize = ({ logger }) => {
   const db_path = Path.join(__dirname, './grill_data.db')

   logger('Initializing db: [%s]', db_path)

   db = SQLite.open(Path.join(__dirname, './grill_data.db'), { Promise })
}

module.exports.createDb = async () => db