
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
        createAlert() {
            return {
                type: alertTypes.targetFoodTempReached,
                name: 'Target Food Temperature Reached',
                Reason: `Food temperature has reached target temperature of ${status.desiredFoodTemp}`
            }
        }
    }
}

module.exports.reset = () => { }