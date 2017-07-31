const gmg = require('GMGClient')
const client = new gmg.GMGClient()
let connected = false

module.exports.discoverGrill = async () => {
  if (!connected) {
    connected = true
    return (await client.discoverGrill())
  }
}

module.exports.client = client