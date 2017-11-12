const alertTypes = require('../../constants/alertTypes')
const path = require('path')

module.exports.name = path.basename(__filename)
module.exports.handle = (status) => {
    return {
        triggered: !!(
            status.desiredFoodTemp &&
            status.desiredGrillTemp &&
            status.desiredFoodTemp >= status.desiredGrillTemp
        ),
        type: alertTypes.targetGrillTempReached
    }
}

module.exports.reset = () => { }