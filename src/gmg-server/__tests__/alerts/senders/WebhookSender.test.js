const WebhookSender = require('../../../alerts/senders/WebhookSender')

describe('WebhookSender', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  test('throws when no webhookUrl provided', () => {
    expect(() => new WebhookSender({})).toThrow('Webhook URL required!')
  })

  test('throws when alertMapper is not a function', () => {
    expect(() => new WebhookSender({
      webhookUrl: 'https://example.com',
      alertMapper: 'not a function'
    })).toThrow('Alert Mapper must be a function!')
  })

  test('uses identity mapper by default', () => {
    const sender = new WebhookSender({ webhookUrl: 'https://example.com' })
    expect(sender._alertMapper({ test: true })).toEqual({ test: true })
  })

  describe('createPostOptions', () => {
    test('creates POST options with correct headers', () => {
      const sender = new WebhookSender({ webhookUrl: 'https://example.com' })
      const options = sender.createPostOptions('{"test": true}')
      expect(options.method).toBe('POST')
      expect(options.body).toBe('{"test": true}')
      expect(options.headers['Content-type']).toBe('application/json')
    })
  })

  describe('send', () => {
    test('sends mapped alert as JSON to webhook URL', async () => {
      global.fetch.mockResolvedValue({ ok: true })
      const mapper = (alert) => ({ transformed: alert.name })
      const sender = new WebhookSender({
        webhookUrl: 'https://example.com/webhook',
        alertMapper: mapper
      })

      await sender.send({ name: 'Test Alert' })

      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/webhook',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ transformed: 'Test Alert' }),
          headers: { 'Content-type': 'application/json' }
        })
      )
    })

    test('throws on non-ok response', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error')
      })

      const sender = new WebhookSender({ webhookUrl: 'https://example.com/webhook' })
      await expect(sender.send({ name: 'Test' })).rejects.toThrow('Invalid webhook response 500')
    })
  })
})
