const WebHookSender = require('./WebhookSender')
const path = require('path')

const slackEscape = (message) => (message || '')
    .replace('&', '&amp;')
    .replace('<', '&lt;')
    .replace('>', '&gt;')


class SlackSender {
    constructor({
        channel = '#grill-alerts',
        linkNames = 1,
        username = 'grill-bot',
        iconEmoji = ':meat_on_bone:',
        webhookUrl
    }) {
        if (!webhookUrl) throw new Error('Webhook Url required!')
        this._channel = channel
        this._linkNames = linkNames
        this._username = username
        this._iconEmoji = iconEmoji
        this._webhookUrl = webhookUrl
        this._webHookSender = new WebHookSender({
            webhookUrl,
            alertMapper: this.createSlackMessage.bind(this)
        })

        this.createSlackMessage = this.createSlackMessage.bind(this)
        this.send = this.send.bind(this)
    }

    get name() {
        return path.basename(__filename)
    }

    createSlackMessage(alert) {
        const escapedText = slackEscape(`*${alert.name}*\n${alert.reason}`)
        return {
            text: escapedText,
            channel: this._channel,
            link_names: this._linkNames,
            username: this._username,
            icon_emoji: this._iconEmoji
        }
    }

    async send(alert) {
        await this._webHookSender.send(alert)
    }
}

module.exports = SlackSender