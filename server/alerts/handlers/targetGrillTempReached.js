const alertTypes = require('../../constants/alertTypes')
const path = require('path')
const moment = require('moment')
const resendIntervalMin = 5
let lastSent = null
let lastState = null

module.exports.name = path.basename(__filename)

module.exports.handle = (status) => {
    const result = {
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
                beep: `alerts/${alertTypes.targetGrillTempReached}.mp3`,
                level: 'info'
            }
        }
    }

    // Determine if the alert can be resent
    if (lastState !== null && lastSent !== null) {
        const stateChanged = lastState !== status.desiredGrillTemp
        const canResend = moment(lastSent).add(resendIntervalMin, 'm').isBefore(moment())
        if (!stateChanged && !canResend) {
            result.triggered = false
        }
    }

    // Update state if sent
    if (result.triggered) {
        lastSent = moment()
        lastState = status.desiredGrillTemp
    }

    return result
}

module.exports.reset = () => {
    lastSent = null
    lastState = null
}