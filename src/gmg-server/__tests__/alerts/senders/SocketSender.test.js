const SocketSender = require('../../../alerts/senders/SocketSender')

describe('SocketSender', () => {
  const alert = {
    type: 'targetFoodTempReached',
    name: 'Target Food Temperature Reached',
    reason: 'Food temperature has reached target temperature of 165',
    beep: 'alerts/targetFoodTempReached.mp3',
    level: 'info'
  }
  let socketManager

  beforeEach(() => {
    socketManager = { broadcast: jest.fn() }
  })

  test('throws when no socket manager provided', () => {
    expect(() => new SocketSender()).toThrow('Socket server required')
  })

  test('throws when no alert provided', () => {
    const sender = new SocketSender(socketManager)
    expect(() => sender.send()).toThrow('Alert required')
  })

  test('broadcasts the alert including its sound by default', () => {
    const sender = new SocketSender(socketManager)
    sender.send(alert)
    expect(socketManager.broadcast).toHaveBeenCalledWith('alert', alert)
  })

  test('broadcasts the alert including its sound when audio is enabled', () => {
    const sender = new SocketSender(socketManager, { audioEnabled: true })
    sender.send(alert)
    expect(socketManager.broadcast).toHaveBeenCalledWith('alert', alert)
  })

  test('strips the sound when audio is disabled', () => {
    const sender = new SocketSender(socketManager, { audioEnabled: false })
    sender.send(alert)

    const { beep, ...expected } = alert
    expect(socketManager.broadcast).toHaveBeenCalledWith('alert', expected)
    expect(alert.beep).toBe('alerts/targetFoodTempReached.mp3') // original not mutated
  })
})
