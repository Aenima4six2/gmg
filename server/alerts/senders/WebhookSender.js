const fetch = require('node-fetch')
const path = require('path')

class SlackSender {
    constructor({ webhookUrl, alertMapper = (alert) => alert }) {
        if (!webhookUrl) throw new Error('Webhook URL required!')
        if (!alertMapper) throw new Error('Alert Mapper function required!')
        if (typeof alertMapper !== 'function') throw new Error('Alert Mapper must be a function!')

        this._webhookUrl = webhookUrl
        this._alertMapper = alertMapper
        this.send = this.send.bind(this)
    }

    get name() {
        return path.basename(__filename)
    }

    createPostOptions(payload) {
        return {
            method: 'POST',
            body: payload,
            headers: {
                'Content-type': 'application/json'
            }
        }
    }

    async send(alert) {
        const mapped = this._alertMapper(alert)
        const json = JSON.stringify(mapped)
        const options = this.createPostOptions(json)
        const response = await fetch(this._webhookUrl, options)
        if (!response.ok) {
            const body = await response.text()
            const status = response.status
            throw new Error(`Invalid webhook response ${status} - ${body}`)
        }
    }
}

module.exports = SlackSender