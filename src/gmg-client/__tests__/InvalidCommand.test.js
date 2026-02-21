const InvalidCommand = require('../InvalidCommand')
const AppError = require('../AppError')

describe('InvalidCommand', () => {
  test('defaults to status 400', () => {
    const error = new InvalidCommand()
    expect(error.status).toBe(400)
  })

  test('defaults message to "Invalid Command"', () => {
    const error = new InvalidCommand()
    expect(error.message).toBe('Invalid Command')
  })

  test('accepts custom message', () => {
    const error = new InvalidCommand('bad input')
    expect(error.message).toBe('bad input')
  })

  test('is instanceof AppError', () => {
    const error = new InvalidCommand()
    expect(error).toBeInstanceOf(AppError)
  })

  test('is instanceof Error', () => {
    const error = new InvalidCommand()
    expect(error).toBeInstanceOf(Error)
  })

  test('sets name to InvalidCommand', () => {
    const error = new InvalidCommand()
    expect(error.name).toBe('InvalidCommand')
  })
})
