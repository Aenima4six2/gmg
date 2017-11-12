const alertTypes = require('../../constants/alertTypes')
const path = require('path')

let desiredTempPrevReached
module.exports.name = path.basename(__filename)
module.exports.handle = (status) => {
    const delta = Math.abs(status.desiredFoodTemp - status.currentFoodTemp)
    if (desiredTempPrevReached) {
        return {
            triggered: delta > 5,
            type: alertTypes.unusualFoodTempDeviation
        }
    }

    desiredTempPrevReached = delta <= 1
    return {
        triggered: false,
        type: alertTypes.unusualFoodTempDeviation
    }
}

module.exports.reset = () => {
    desiredTempPrevReached = false
}