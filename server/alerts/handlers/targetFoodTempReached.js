const alertTypes = require('../../constants/alertTypes')
const path = require('path')
let alreadyFired = false
let lastTemp = 0

const createResults = (status) => ({
    triggered: (
        status.isOn &&
        status.currentFoodTemp &&
        status.desiredFoodTemp &&
        status.currentFoodTemp >= status.desiredFoodTemp
    ),
    createAlert() {
        return {
            type: alertTypes.targetFoodTempReached,
            name: 'Target Food Temperature Reached',
            reason: `Food temperature has reached target temperature of ${status.desiredFoodTemp}`
        }
    }
})

module.exports.name = path.basename(__filename)

module.exports.handle = (status) => {
    // Set or reset current state
    const targetTemp = status.desiredFoodTemp
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