const GMGClient = require('../GMGClient')
const InvalidCommand = require('../InvalidCommand')
const GrillStatus = require('../GrillStatus')

// Helper to create a mock grill status buffer (on state)
function createOnBuffer() {
  const buf = Buffer.alloc(32, 0)
  buf[2] = 225     // currentGrillTemp = 225
  buf[6] = 0xFA    // desiredGrillTemp = 250
  buf[6] = 250 & 0xFF
  buf[4] = 145     // currentFoodTemp = 145
  buf[28] = 200    // desiredFoodTemp = 200
  buf[30] = 1      // state = on
  return buf
}

function createOffBuffer() {
  const buf = Buffer.alloc(32, 0)
  buf[30] = 0 // state = off
  return buf
}

function createFanModeBuffer() {
  const buf = Buffer.alloc(32, 0)
  buf[30] = 2 // state = fan mode
  return buf
}

describe('GMGClient', () => {
  describe('constructor', () => {
    test('uses default options when none provided', () => {
      const client = new GMGClient()
      expect(client.port).toBe(8080)
      expect(client.host).toBe('255.255.255.255')
      expect(client.tries).toBe(5)
      expect(client.retryMs).toBe(2000)
    })

    test('accepts custom options', () => {
      const client = new GMGClient({
        port: 9090,
        host: '192.168.1.100',
        tries: 3,
        retryMs: 1000
      })
      expect(client.port).toBe(9090)
      expect(client.host).toBe('192.168.1.100')
      expect(client.tries).toBe(3)
      expect(client.retryMs).toBe(1000)
    })

    test('logger is callable when provided', () => {
      const logs = []
      const client = new GMGClient({ logger: (msg) => logs.push(msg) })
      client._logger('test message')
      expect(logs).toContain('test message')
    })

    test('logger is no-op when not provided', () => {
      const client = new GMGClient()
      expect(() => client._logger('test')).not.toThrow()
    })
  })

  describe('sendCommand', () => {
    test('throws when host is broadcast address', async () => {
      const client = new GMGClient()
      await expect(client.sendCommand('UR001!')).rejects.toThrow('Grill host is broadcast address')
    })
  })

  describe('discoverGrill', () => {
    test('skips discovery when host does not contain broadcast octet', async () => {
      const logs = []
      const client = new GMGClient({
        host: '192.168.1.100',
        logger: (msg) => logs.push(msg)
      })
      await client.discoverGrill()
      expect(logs.some(l => l.includes('skipping discovery'))).toBe(true)
    })
  })

  describe('setGrillTemp', () => {
    test('throws InvalidCommand when grill is off', async () => {
      const client = new GMGClient({ host: '192.168.1.100' })
      // Mock sendCommand to return an off status
      client.sendCommand = jest.fn().mockResolvedValue({
        msg: createOffBuffer(),
        info: { address: '192.168.1.100' }
      })
      await expect(client.setGrillTemp(250)).rejects.toThrow(InvalidCommand)
    })
  })

  describe('setFoodTemp', () => {
    test('throws InvalidCommand when grill is off', async () => {
      const client = new GMGClient({ host: '192.168.1.100' })
      client.sendCommand = jest.fn().mockResolvedValue({
        msg: createOffBuffer(),
        info: { address: '192.168.1.100' }
      })
      await expect(client.setFoodTemp(165)).rejects.toThrow(InvalidCommand)
    })
  })

  describe('powerToggleGrill', () => {
    test('sends power off when grill is on', async () => {
      const client = new GMGClient({ host: '192.168.1.100' })

      let callCount = 0
      client.sendCommand = jest.fn().mockImplementation((cmd) => {
        callCount++
        // First call: getGrillStatus, second call: powerOff command
        if (cmd === 'UR001!') {
          return Promise.resolve({ msg: createOnBuffer(), info: { address: '192.168.1.100' } })
        }
        // powerOff returns OK
        return Promise.resolve({ msg: Buffer.from('OK'), info: { address: '192.168.1.100' } })
      })

      await client.powerToggleGrill()
      // Should have called sendCommand for status check + power off
      expect(client.sendCommand).toHaveBeenCalledWith('UK004!')
    })

    test('throws when trying to power on during fan mode', async () => {
      const client = new GMGClient({ host: '192.168.1.100' })
      client.sendCommand = jest.fn().mockResolvedValue({
        msg: createFanModeBuffer(),
        info: { address: '192.168.1.100' }
      })

      await expect(client.powerToggleGrill()).rejects.toThrow(InvalidCommand)
    })
  })

  describe('_validateResult', () => {
    test('returns when response is OK', async () => {
      const client = new GMGClient()
      const result = { msg: Buffer.from('OK') }
      await expect(client._validateResult(result, () => false)).resolves.toBeUndefined()
    })

    test('returns when validator passes', async () => {
      const client = new GMGClient()
      const result = { msg: createOnBuffer() }
      await expect(client._validateResult(result, () => true)).resolves.toBeUndefined()
    })

    test('throws when validator fails', async () => {
      const client = new GMGClient()
      const result = { msg: createOnBuffer() }
      await expect(client._validateResult(result, () => false)).rejects.toThrow('invalid status')
    })
  })
})
