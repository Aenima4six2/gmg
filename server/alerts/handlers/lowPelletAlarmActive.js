const alertTypes = require('../../constants/alertTypes')
const path = require('path')
const moment = require('moment')
let lastSent

const createResults = (status) => {
    // Only send the alert once every min
    const canSend = !lastSent || moment(lastSent).add(1, 'm').isBefore(moment())
    if (canSend) lastSent = moment()

    return {
        triggered: status.lowPelletAlarmActive && canSend,
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
}

module.exports.name = path.basename(__filename)

module.exports.handle = (status) => createResults(status)

module.exports.reset = () => { }