const alertTypes = require('../../constants/alertTypes')
const path = require('path')
let alreadyFired = false
let lastTemp = 0

const createResults = (status) => ({
    triggered: !!(
        status.isOn &&
        status.currentGrillTemp &&
        status.desiredGrillTemp &&
        status.currentGrillTemp >= status.desiredGrillTemp
    ),
    createAlert() {
        return {
            type: alertTypes.targetGrillTempReached,
            name: 'Target Grill Temperature Reached',
            reason: `Grill temperature has reached target temperature of ${status.desiredGrillTemp}`,
            beep: 'alerts/grillTempReached.mp3'
        }
    }
})

module.exports.name = path.basename(__filename)

module.exports.handle = (status) => {
    // Set or reset current state
    const targetTemp = status.desiredGrillTemp
    if (lastTemp !== targetTemp) {
        alreadyFired = false
    }
    lastTemp = targetTemp

    // Only send the alert once per desired Food Temp 
    const result = createResults(status)
    if (alreadyFired) {
        result.triggered = false
    } else {
        alreadyFired = result.triggered
    }

    return result
}
module.exports.reset = () => {
    alreadyFired = false
    lastTemp = 0
}