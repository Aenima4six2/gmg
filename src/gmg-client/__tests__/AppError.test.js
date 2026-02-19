const AppError = require('../AppError')

describe('AppError', () => {
  test('sets message from constructor', () => {
    const error = new AppError('something broke')
    expect(error.message).toBe('something broke')
  })

  test('defaults status to 500', () => {
    const error = new AppError('server error')
    expect(error.status).toBe(500)
  })

  test('accepts custom status', () => {
    const error = new AppError('not found', 404)
    expect(error.status).toBe(404)
  })

  test('sets name to class name', () => {
    const error = new AppError('test')
    expect(error.name).toBe('AppError')
  })

  test('is instanceof Error', () => {
    const error = new AppError('test')
    expect(error).toBeInstanceOf(Error)
  })

  test('has stack trace', () => {
    const error = new AppError('test')
    expect(error.stack).toBeDefined()
    expect(error.stack).toContain('AppError')
  })
})
