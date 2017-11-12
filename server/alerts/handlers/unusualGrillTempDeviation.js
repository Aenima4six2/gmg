const alertTypes = require('../../constants/alertTypes')
const path = require('path')

let desiredTempPrevReached
module.exports.name = path.basename(__filename)
module.exports.handle = (status) => {
    const delta = Math.abs(status.desiredGrillTemp - status.currentGrillTemp)
    if (desiredTempPrevReached) {
        return {
            triggered: delta > 15,
            type: alertTypes.unusualGrillTempDeviation
        }
    }

    desiredTempPrevReached = delta <= 3
    return {
        triggered: false,
        type: alertTypes.unusualGrillTempDeviation
    }
}

module.exports.reset = () => {
    desiredTempPrevReached = false
}