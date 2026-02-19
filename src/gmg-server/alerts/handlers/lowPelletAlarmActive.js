const alertTypes = require('../../constants/alertTypes')
const path = require('path')
const resendIntervalMin = 1
let lastSent = null
let lastState = null

module.exports.name = path.basename(__filename)

module.exports.handle = (status) => {
    const result = {
        triggered: status.lowPelletAlarmActive,
        createAlert() {
            return {
                type: alertTypes.lowPelletAlarmActive,
                name: 'Grill Pellet Alarm',
                reason: 'The grill is low on pellets. Please inspect the hopper as soon as possible!',
                beep: `alerts/${alertTypes.lowPelletAlarmActive}.mp3`,
                level: 'warning'
            }
        }
    }

    // Determine if the alert can be resent
    if (lastState !== null && lastSent !== null) {
        const stateChanged = lastState !== status.lowPelletAlarmActive
        const canResend = !lastSent || (lastSent.getTime() + resendIntervalMin * 60000) < Date.now()
        if (!stateChanged && !canResend) {
            result.triggered = false
        }
    }

    // Update state if sent
    if (result.triggered) {
        lastSent = new Date()
        lastState = status.lowPelletAlarmActive
    }

    return result
}


module.exports.reset = () => {
    lastSent = null
    lastState = null
}
