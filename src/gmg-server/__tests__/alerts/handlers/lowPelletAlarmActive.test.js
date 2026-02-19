const handler = require('../../../alerts/handlers/lowPelletAlarmActive')

describe('lowPelletAlarmActive handler', () => {
  beforeEach(() => {
    handler.reset()
  })

  test('triggers when low pellet alarm is active', () => {
    const result = handler.handle({ lowPelletAlarmActive: true })
    expect(result.triggered).toBe(true)
  })

  test('does not trigger when low pellet alarm is inactive', () => {
    const result = handler.handle({ lowPelletAlarmActive: false })
    expect(result.triggered).toBe(false)
  })

  test('creates alert with correct type and warning level', () => {
    const result = handler.handle({ lowPelletAlarmActive: true })
    const alert = result.createAlert()
    expect(alert.type).toBe('lowPelletAlarmActive')
    expect(alert.name).toBe('Grill Pellet Alarm')
    expect(alert.level).toBe('warning')
    expect(alert.reason).toContain('pellets')
  })

  test('does not re-trigger for same state within resend interval', () => {
    handler.handle({ lowPelletAlarmActive: true })

    const second = handler.handle({ lowPelletAlarmActive: true })
    expect(second.triggered).toBe(false)
  })

  test('does not re-trigger after intermediate false (lastState unchanged)', () => {
    // First call triggers and sets lastState=true
    handler.handle({ lowPelletAlarmActive: true })
    // Second call is not triggered, so lastState stays true
    handler.handle({ lowPelletAlarmActive: false })
    // Third call: lastState is still true, same as current, within resend interval
    const result = handler.handle({ lowPelletAlarmActive: true })
    expect(result.triggered).toBe(false)
  })

  test('reset clears state', () => {
    handler.handle({ lowPelletAlarmActive: true })
    handler.reset()

    const result = handler.handle({ lowPelletAlarmActive: true })
    expect(result.triggered).toBe(true)
  })
})
