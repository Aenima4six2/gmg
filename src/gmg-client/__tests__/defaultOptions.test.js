const defaults = require('../defaultOptions')

describe('defaultOptions', () => {
  test('has expected default values', () => {
    expect(defaults.port).toBe(8080)
    expect(defaults.host).toBe('255.255.255.255')
    expect(defaults.tries).toBe(5)
    expect(defaults.retryMs).toBe(2000)
  })

  test('is frozen (immutable)', () => {
    expect(Object.isFrozen(defaults)).toBe(true)
  })

  test('cannot be modified', () => {
    expect(() => {
      'use strict'
      defaults.port = 9999
    }).toThrow()
  })
})
