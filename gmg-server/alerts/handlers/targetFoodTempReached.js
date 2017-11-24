const alertTypes = require('../../constants/alertTypes')
const path = require('path')
const moment = require('moment')
const resendIntervalMin = 5
let lastSent = null
let lastState = null

module.exports.name = path.basename(__filename)

module.exports.handle = (status) => {
    const result = {
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
                reason: `Food temperature has reached target temperature of ${status.desiredFoodTemp}`,
                beep: `alerts/${alertTypes.targetFoodTempReached}.mp3`,
                level: 'info'
            }
        }
    }

    // Determine if the alert can be resent
    if (lastState !== null && lastSent !== null) {
        const stateChanged = lastState !== status.desiredFoodTemp
        const canResend = moment(lastSent).add(resendIntervalMin, 'm').isBefore(moment())
        if (!stateChanged && !canResend) {
            result.triggered = false
        }
    }

    // Update state if sent
    if (result.triggered) {
        lastSent = moment()
        lastState = status.desiredFoodTemp
    }

    return result
}

module.exports.reset = () => {
    lastSent = null
    lastState = null
}