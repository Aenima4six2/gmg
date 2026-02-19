const EventEmitter = require('events')
const AlertManager = require('../../alerts/AlertManager')

describe('AlertManager', () => {
  let pollingClient
  let manager

  beforeEach(() => {
    pollingClient = new EventEmitter()
  })

  test('start subscribes to status events', () => {
    manager = new AlertManager({
      handlers: [],
      senders: [],
      pollingClient
    })
    manager.start()
    expect(pollingClient.listenerCount('status')).toBe(1)
  })

  test('start throws if already started', () => {
    manager = new AlertManager({
      handlers: [],
      senders: [],
      pollingClient
    })
    manager.start()
    expect(() => manager.start()).toThrow('Already started!')
  })

  test('stop removes status listener', () => {
    manager = new AlertManager({
      handlers: [],
      senders: [],
      pollingClient
    })
    manager.start()
    manager.stop()
    expect(pollingClient.listenerCount('status')).toBe(0)
  })

  test('stop throws if not started', () => {
    manager = new AlertManager({
      handlers: [],
      senders: [],
      pollingClient
    })
    expect(() => manager.stop()).toThrow('Already stopped!')
  })

  describe('sendAlerts', () => {
    test('calls handlers and sends triggered alerts to all senders', async () => {
      const mockAlert = { type: 'test', name: 'Test Alert' }
      const mockHandler = {
        name: 'testHandler',
        handle: jest.fn().mockReturnValue({
          triggered: true,
          createAlert: () => mockAlert
        })
      }
      const mockSender = {
        name: 'testSender',
        send: jest.fn().mockResolvedValue()
      }

      manager = new AlertManager({
        handlers: [mockHandler],
        senders: [mockSender],
        pollingClient
      })

      const status = { isOn: true, currentGrillTemp: 250 }
      await manager.sendAlerts(status)

      expect(mockHandler.handle).toHaveBeenCalledWith(status)
      expect(mockSender.send).toHaveBeenCalledWith(mockAlert)
    })

    test('does not send when no handlers trigger', async () => {
      const mockHandler = {
        name: 'testHandler',
        handle: jest.fn().mockReturnValue({ triggered: false })
      }
      const mockSender = {
        name: 'testSender',
        send: jest.fn()
      }

      manager = new AlertManager({
        handlers: [mockHandler],
        senders: [mockSender],
        pollingClient
      })

      await manager.sendAlerts({ isOn: true })
      expect(mockSender.send).not.toHaveBeenCalled()
    })

    test('sends to multiple senders', async () => {
      const mockHandler = {
        name: 'testHandler',
        handle: jest.fn().mockReturnValue({
          triggered: true,
          createAlert: () => ({ type: 'test' })
        })
      }
      const sender1 = { name: 'sender1', send: jest.fn().mockResolvedValue() }
      const sender2 = { name: 'sender2', send: jest.fn().mockResolvedValue() }

      manager = new AlertManager({
        handlers: [mockHandler],
        senders: [sender1, sender2],
        pollingClient
      })

      await manager.sendAlerts({ isOn: true })
      expect(sender1.send).toHaveBeenCalled()
      expect(sender2.send).toHaveBeenCalled()
    })

    test('handles errors without throwing', async () => {
      const mockHandler = {
        name: 'testHandler',
        handle: jest.fn().mockImplementation(() => { throw new Error('handler error') })
      }

      manager = new AlertManager({
        handlers: [mockHandler],
        senders: [],
        pollingClient
      })

      // Should not throw
      await expect(manager.sendAlerts({ isOn: true })).resolves.toBeUndefined()
    })
  })
})
