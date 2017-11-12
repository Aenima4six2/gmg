
const alertTypes = require('../../constants/alertTypes')
const path = require('path')

module.exports.name = path.basename(__filename)
module.exports.handle = (status) => {
    return {
        triggered: !!(
            status.currentFoodTemp &&
            status.desiredFoodTemp &&
            status.currentFoodTemp >= status.desiredFoodTemp
        ),
        type: alertTypes.targetFoodTempReached
    }
}

module.exports.reset = () => { }