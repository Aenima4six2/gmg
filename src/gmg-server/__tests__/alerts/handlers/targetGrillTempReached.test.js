const handler = require('../../../alerts/handlers/targetGrillTempReached')

describe('targetGrillTempReached handler', () => {
  beforeEach(() => {
    handler.reset()
  })

  test('triggers when grill temp reaches desired temp', () => {
    const result = handler.handle({
      isOn: true,
      currentGrillTemp: 250,
      desiredGrillTemp: 250
    })
    expect(result.triggered).toBe(true)
  })

  test('triggers when grill temp exceeds desired temp', () => {
    const result = handler.handle({
      isOn: true,
      currentGrillTemp: 260,
      desiredGrillTemp: 250
    })
    expect(result.triggered).toBe(true)
  })

  test('does not trigger when grill is off', () => {
    const result = handler.handle({
      isOn: false,
      currentGrillTemp: 250,
      desiredGrillTemp: 250
    })
    expect(result.triggered).toBe(false)
  })

  test('does not trigger when current temp is below desired', () => {
    const result = handler.handle({
      isOn: true,
      currentGrillTemp: 200,
      desiredGrillTemp: 250
    })
    expect(result.triggered).toBe(false)
  })

  test('does not trigger when current grill temp is 0', () => {
    const result = handler.handle({
      isOn: true,
      currentGrillTemp: 0,
      desiredGrillTemp: 250
    })
    expect(result.triggered).toBe(false)
  })

  test('does not trigger when desired grill temp is 0', () => {
    const result = handler.handle({
      isOn: true,
      currentGrillTemp: 250,
      desiredGrillTemp: 0
    })
    expect(result.triggered).toBe(false)
  })

  test('creates alert with correct type and info', () => {
    const result = handler.handle({
      isOn: true,
      currentGrillTemp: 250,
      desiredGrillTemp: 250
    })
    const alert = result.createAlert()
    expect(alert.type).toBe('targetGrillTempReached')
    expect(alert.name).toBe('Target Grill Temperature Reached')
    expect(alert.reason).toContain('250')
    expect(alert.level).toBe('info')
  })

  test('does not re-trigger for same desired temp (resend prevention)', () => {
    // First trigger
    const first = handler.handle({
      isOn: true,
      currentGrillTemp: 250,
      desiredGrillTemp: 250
    })
    expect(first.triggered).toBe(true)

    // Same desired temp - should not re-trigger
    const second = handler.handle({
      isOn: true,
      currentGrillTemp: 255,
      desiredGrillTemp: 250
    })
    expect(second.triggered).toBe(false)
  })

  test('re-triggers when desired temp changes', () => {
    // First trigger at 250
    handler.handle({
      isOn: true,
      currentGrillTemp: 250,
      desiredGrillTemp: 250
    })

    // New desired temp of 300 - should re-trigger
    const result = handler.handle({
      isOn: true,
      currentGrillTemp: 300,
      desiredGrillTemp: 300
    })
    expect(result.triggered).toBe(true)
  })

  test('reset clears state allowing re-trigger', () => {
    handler.handle({
      isOn: true,
      currentGrillTemp: 250,
      desiredGrillTemp: 250
    })

    handler.reset()

    const result = handler.handle({
      isOn: true,
      currentGrillTemp: 250,
      desiredGrillTemp: 250
    })
    expect(result.triggered).toBe(true)
  })
})
