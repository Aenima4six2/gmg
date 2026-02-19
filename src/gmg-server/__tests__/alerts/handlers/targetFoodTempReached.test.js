const handler = require('../../../alerts/handlers/targetFoodTempReached')

describe('targetFoodTempReached handler', () => {
  beforeEach(() => {
    handler.reset()
  })

  test('triggers when food temp reaches desired temp', () => {
    const result = handler.handle({
      isOn: true,
      currentFoodTemp: 165,
      desiredFoodTemp: 165
    })
    expect(result.triggered).toBeTruthy()
  })

  test('triggers when food temp exceeds desired temp', () => {
    const result = handler.handle({
      isOn: true,
      currentFoodTemp: 170,
      desiredFoodTemp: 165
    })
    expect(result.triggered).toBeTruthy()
  })

  test('does not trigger when grill is off', () => {
    const result = handler.handle({
      isOn: false,
      currentFoodTemp: 165,
      desiredFoodTemp: 165
    })
    expect(result.triggered).toBeFalsy()
  })

  test('does not trigger when current food temp is below desired', () => {
    const result = handler.handle({
      isOn: true,
      currentFoodTemp: 100,
      desiredFoodTemp: 165
    })
    expect(result.triggered).toBeFalsy()
  })

  test('does not trigger when current food temp is 0', () => {
    const result = handler.handle({
      isOn: true,
      currentFoodTemp: 0,
      desiredFoodTemp: 165
    })
    expect(result.triggered).toBeFalsy()
  })

  test('does not trigger when desired food temp is 0', () => {
    const result = handler.handle({
      isOn: true,
      currentFoodTemp: 165,
      desiredFoodTemp: 0
    })
    expect(result.triggered).toBeFalsy()
  })

  test('creates alert with correct type and info', () => {
    const result = handler.handle({
      isOn: true,
      currentFoodTemp: 165,
      desiredFoodTemp: 165
    })
    const alert = result.createAlert()
    expect(alert.type).toBe('targetFoodTempReached')
    expect(alert.name).toBe('Target Food Temperature Reached')
    expect(alert.reason).toContain('165')
    expect(alert.level).toBe('info')
  })

  test('does not re-trigger for same desired temp', () => {
    handler.handle({
      isOn: true,
      currentFoodTemp: 165,
      desiredFoodTemp: 165
    })

    const second = handler.handle({
      isOn: true,
      currentFoodTemp: 170,
      desiredFoodTemp: 165
    })
    expect(second.triggered).toBeFalsy()
  })

  test('re-triggers when desired food temp changes', () => {
    handler.handle({
      isOn: true,
      currentFoodTemp: 165,
      desiredFoodTemp: 165
    })

    const result = handler.handle({
      isOn: true,
      currentFoodTemp: 200,
      desiredFoodTemp: 200
    })
    expect(result.triggered).toBeTruthy()
  })
})
