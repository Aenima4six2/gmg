const SlackSender = require('../../../alerts/senders/SlackSender')

// Mock global fetch (modernize branch uses native fetch)
global.fetch = jest.fn(() => Promise.resolve({ ok: true }))

describe('SlackSender', () => {
  beforeEach(() => {
    global.fetch.mockClear()
  })

  test('throws when no webhookUrl provided', () => {
    expect(() => new SlackSender({})).toThrow('Webhook Url required!')
  })

  test('uses default channel, username, and emoji', () => {
    const sender = new SlackSender({ webhookUrl: 'https://hooks.slack.com/test' })
    expect(sender._channel).toBe('#grill-alerts')
    expect(sender._username).toBe('grill-bot')
    expect(sender._iconEmoji).toBe(':meat_on_bone:')
  })

  test('accepts custom options', () => {
    const sender = new SlackSender({
      webhookUrl: 'https://hooks.slack.com/test',
      channel: '#custom',
      username: 'custom-bot',
      iconEmoji: ':fire:'
    })
    expect(sender._channel).toBe('#custom')
    expect(sender._username).toBe('custom-bot')
    expect(sender._iconEmoji).toBe(':fire:')
  })

  describe('createSlackMessage', () => {
    let sender
    beforeEach(() => {
      sender = new SlackSender({ webhookUrl: 'https://hooks.slack.com/test' })
    })

    test('formats alert into slack message', () => {
      const alert = {
        name: 'Test Alert',
        reason: 'Something happened'
      }
      const message = sender.createSlackMessage(alert)
      expect(message.text).toContain('Test Alert')
      expect(message.text).toContain('Something happened')
      expect(message.channel).toBe('#grill-alerts')
      expect(message.username).toBe('grill-bot')
      expect(message.icon_emoji).toBe(':meat_on_bone:')
    })

    test('escapes ampersands in message', () => {
      const alert = { name: 'A & B', reason: 'test' }
      const message = sender.createSlackMessage(alert)
      expect(message.text).toContain('&amp;')
    })

    test('escapes all ampersands (regex global)', () => {
      const alert = { name: 'A & B & C', reason: 'test' }
      const message = sender.createSlackMessage(alert)
      // Should escape both ampersands
      const ampCount = (message.text.match(/&amp;/g) || []).length
      expect(ampCount).toBe(2)
    })

    test('escapes angle brackets in message', () => {
      const alert = { name: '<script>', reason: 'test' }
      const message = sender.createSlackMessage(alert)
      expect(message.text).toContain('&lt;')
      expect(message.text).toContain('&gt;')
    })
  })
})
