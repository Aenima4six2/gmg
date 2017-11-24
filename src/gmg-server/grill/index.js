const GMGClient = require('gmg-client').GMGClient
const config = require('config')
const options = config.get('grill')
let clientCache

module.exports.initialize = ({ logger }) => {
    clientCache = new GMGClient({
        ...options,
        logger
    })
    return clientCache
}

module.exports.createClient = () => clientCache

