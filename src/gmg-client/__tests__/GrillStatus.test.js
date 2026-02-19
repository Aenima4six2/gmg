const GrillStatus = require('../GrillStatus')

// Helper to create a buffer with specific hex values at known positions
// GrillStatus hex layout:
//   pos 4-5:  currentGrillTemp low byte
//   pos 6-7:  currentGrillTemp high byte
//   pos 8-9:  currentFoodTemp low byte
//   pos 10-11: currentFoodTemp high byte
//   pos 12-13: desiredGrillTemp low byte
//   pos 14-15: desiredGrillTemp high byte
//   pos 48-49: lowPelletAlarm low byte
//   pos 50-51: lowPelletAlarm high byte
//   pos 56-57: desiredFoodTemp low byte
//   pos 58-59: desiredFoodTemp high byte
//   pos 61:    state character (0=off, 1=on, 2=fan mode)

function createGrillBuffer({
  currentGrillTemp = 0,
  currentFoodTemp = 0,
  desiredGrillTemp = 0,
  desiredFoodTemp = 0,
  state = 0,
  lowPelletAlarm = 0
} = {}) {
  // We need at least 31 bytes (62 hex chars, plus the state char at position 61)
  const buf = Buffer.alloc(32, 0)

  // currentGrillTemp at hex positions 4-7 (bytes 2-3)
  buf[2] = currentGrillTemp & 0xFF
  buf[3] = (currentGrillTemp >> 8) & 0xFF

  // currentFoodTemp at hex positions 8-11 (bytes 4-5)
  buf[4] = currentFoodTemp & 0xFF
  buf[5] = (currentFoodTemp >> 8) & 0xFF

  // desiredGrillTemp at hex positions 12-15 (bytes 6-7)
  buf[6] = desiredGrillTemp & 0xFF
  buf[7] = (desiredGrillTemp >> 8) & 0xFF

  // lowPelletAlarm at hex positions 48-51 (bytes 24-25)
  buf[24] = lowPelletAlarm & 0xFF
  buf[25] = (lowPelletAlarm >> 8) & 0xFF

  // desiredFoodTemp at hex positions 56-59 (bytes 28-29)
  buf[28] = desiredFoodTemp & 0xFF
  buf[29] = (desiredFoodTemp >> 8) & 0xFF

  // State at hex position 61 (byte 30, high nibble=position 60, low nibble=position 61)
  // position 61 is the second hex char of byte 30
  // byte 30 hex = XY where X is pos 60, Y is pos 61
  buf[30] = state  // state goes in the low nibble

  return buf
}

describe('GrillStatus', () => {
  describe('state parsing', () => {
    test('parses state as "off" when state byte is 0', () => {
      const buf = createGrillBuffer({ state: 0 })
      const status = new GrillStatus(buf)
      expect(status.state).toBe('off')
      expect(status.isOn).toBe(false)
      expect(status.fanModeActive).toBe(false)
    })

    test('parses state as "on" when state byte is 1', () => {
      const buf = createGrillBuffer({ state: 1 })
      const status = new GrillStatus(buf)
      expect(status.state).toBe('on')
      expect(status.isOn).toBe(true)
      expect(status.fanModeActive).toBe(false)
    })

    test('parses state as "fan mode" when state byte is 2', () => {
      const buf = createGrillBuffer({ state: 2 })
      const status = new GrillStatus(buf)
      expect(status.state).toBe('fan mode')
      expect(status.isOn).toBe(false)
      expect(status.fanModeActive).toBe(true)
    })

    test('parses state as "unknown" for unrecognized values', () => {
      const buf = createGrillBuffer({ state: 5 })
      const status = new GrillStatus(buf)
      expect(status.state).toBe('unknown')
      expect(status.isOn).toBe(false)
    })
  })

  describe('temperature parsing', () => {
    test('parses current grill temperature', () => {
      const buf = createGrillBuffer({ currentGrillTemp: 225, state: 1 })
      const status = new GrillStatus(buf)
      expect(status.currentGrillTemp).toBe(225)
    })

    test('parses high grill temperature using both bytes', () => {
      const buf = createGrillBuffer({ currentGrillTemp: 500, state: 1 })
      const status = new GrillStatus(buf)
      expect(status.currentGrillTemp).toBe(500)
    })

    test('parses desired grill temperature when on', () => {
      const buf = createGrillBuffer({ desiredGrillTemp: 350, state: 1 })
      const status = new GrillStatus(buf)
      expect(status.desiredGrillTemp).toBe(350)
    })

    test('desired grill temperature is 0 when grill is off', () => {
      const buf = createGrillBuffer({ desiredGrillTemp: 350, state: 0 })
      const status = new GrillStatus(buf)
      expect(status.desiredGrillTemp).toBe(0)
    })

    test('parses current food temperature', () => {
      const buf = createGrillBuffer({ currentFoodTemp: 165, state: 1 })
      const status = new GrillStatus(buf)
      expect(status.currentFoodTemp).toBe(165)
    })

    test('caps current food temperature at 0 when >= 557', () => {
      const buf = createGrillBuffer({ currentFoodTemp: 557, state: 1 })
      const status = new GrillStatus(buf)
      expect(status.currentFoodTemp).toBe(0)
    })

    test('caps current food temperature at 0 when > 557', () => {
      const buf = createGrillBuffer({ currentFoodTemp: 600, state: 1 })
      const status = new GrillStatus(buf)
      expect(status.currentFoodTemp).toBe(0)
    })

    test('allows food temperature just below 557', () => {
      const buf = createGrillBuffer({ currentFoodTemp: 556, state: 1 })
      const status = new GrillStatus(buf)
      expect(status.currentFoodTemp).toBe(556)
    })

    test('parses desired food temperature when on', () => {
      const buf = createGrillBuffer({ desiredFoodTemp: 200, state: 1 })
      const status = new GrillStatus(buf)
      expect(status.desiredFoodTemp).toBe(200)
    })

    test('desired food temperature is 0 when grill is off', () => {
      const buf = createGrillBuffer({ desiredFoodTemp: 200, state: 0 })
      const status = new GrillStatus(buf)
      expect(status.desiredFoodTemp).toBe(0)
    })
  })

  describe('low pellet alarm', () => {
    test('low pellet alarm is active when value is 128', () => {
      const buf = createGrillBuffer({ lowPelletAlarm: 128, state: 1 })
      const status = new GrillStatus(buf)
      expect(status.lowPelletAlarmActive).toBe(true)
    })

    test('low pellet alarm is inactive when value is 0', () => {
      const buf = createGrillBuffer({ lowPelletAlarm: 0, state: 1 })
      const status = new GrillStatus(buf)
      expect(status.lowPelletAlarmActive).toBe(false)
    })

    test('low pellet alarm is inactive for non-128 values', () => {
      const buf = createGrillBuffer({ lowPelletAlarm: 64, state: 1 })
      const status = new GrillStatus(buf)
      expect(status.lowPelletAlarmActive).toBe(false)
    })
  })

  describe('combined state', () => {
    test('typical grilling session state', () => {
      const buf = createGrillBuffer({
        currentGrillTemp: 225,
        desiredGrillTemp: 250,
        currentFoodTemp: 145,
        desiredFoodTemp: 200,
        state: 1,
        lowPelletAlarm: 0
      })
      const status = new GrillStatus(buf)
      expect(status.isOn).toBe(true)
      expect(status.currentGrillTemp).toBe(225)
      expect(status.desiredGrillTemp).toBe(250)
      expect(status.currentFoodTemp).toBe(145)
      expect(status.desiredFoodTemp).toBe(200)
      expect(status.lowPelletAlarmActive).toBe(false)
      expect(status.fanModeActive).toBe(false)
    })
  })
})
