const alertTypes = require('../../constants/alertTypes')
const path = require('path')

const createResults = (status) => ({
    triggered: status.lowPelletAlarmActive,
    createAlert() {
        return {
            type: alertTypes.lowPelletAlarmActive,
            name: 'Grill Pellet Alarm',
            reason: 'The grill is low on pellets. Please inspect the hopper as soon as possible!',
            beep: 'alerts/warning.mp3'
        }
    }
})

module.exports.name = path.basename(__filename)

module.exports.handle = (status) => {
    const result = createResults(status)
    return result
}

module.exports.reset = () => { }