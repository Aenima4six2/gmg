const { routeHandler } = require('../../routes/util')
const { Errors } = require('gmg-client')

describe('routeHandler', () => {
  let req, res, next

  beforeEach(() => {
    req = {}
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    }
    next = jest.fn()
  })

  test('calls the handler with req and res', async () => {
    const handler = jest.fn()
    const wrapped = routeHandler(handler)
    await wrapped(req, res, next)
    expect(handler).toHaveBeenCalledWith(req, res)
  })

  test('catches InvalidCommand and responds with 400', async () => {
    const handler = jest.fn().mockRejectedValue(new Errors.InvalidCommand('bad request'))
    const wrapped = routeHandler(handler)
    await wrapped(req, res, next)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith('bad request')
    expect(next).not.toHaveBeenCalled()
  })

  test('passes other errors to next()', async () => {
    const error = new Error('something else')
    const handler = jest.fn().mockRejectedValue(error)
    const wrapped = routeHandler(handler)
    await wrapped(req, res, next)
    expect(next).toHaveBeenCalledWith(error)
    expect(res.status).not.toHaveBeenCalled()
  })
})
