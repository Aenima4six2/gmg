const alertTypes = require('../../constants/alertTypes')
const path = require('path')
const moment = require('moment')
let lastSent

const createResults = (status) => {
    const canSend = !lastSent || moment(lastSent).add(15, 'm').isBefore(moment())
    lastSent = moment()
    
    return {
        triggered: status.lowPelletAlarmActive && canSend,
        createAlert() {
            return {
                type: alertTypes.lowPelletAlarmActive,
                name: 'Grill Pellet Alarm',
                reason: 'The grill is low on pellets. Please inspect the hopper as soon as possible!',
                beep: 'alerts/warning.mp3'
            }
        }
    }
}

module.exports.name = path.basename(__filename)

module.exports.handle = (status) => createResults(status)

module.exports.reset = () => { }