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
        createAlert() {
            return {
                type: alertTypes.targetGrillTempReached,
                name: 'Target Grill Temperature Reached',
                Reason: `Grill temperature has reached target temperature of ${status.desiredGrillTemp}`
            }
        }
    }
}
module.exports.reset = () => { }