const request = require('supertest')
const { Errors } = require('gmg-client')

jest.mock('../grill', () => ({ createClient: jest.fn() }))
jest.mock('../data', () => ({ createDb: jest.fn() }))

const clientFactory = require('../grill')
const dbFactory = require('../data')
const appFactory = require('../app')

// HTTP-level tests against the real Express app (routing, middleware, static
// files, 404 and error handling), with the grill client and db mocked out.
describe('app', () => {
  let app, client, db

  beforeEach(() => {
    client = {
      getGrillStatus: jest.fn().mockResolvedValue({ isOn: true, currentGrillTemp: 225 }),
      powerToggleGrill: jest.fn().mockResolvedValue(),
      powerOnGrill: jest.fn().mockResolvedValue(),
      powerOffGrill: jest.fn().mockResolvedValue(),
      setGrillTemp: jest.fn().mockResolvedValue(),
      setFoodTemp: jest.fn().mockResolvedValue()
    }
    db = { all: jest.fn().mockResolvedValue([{ timestamp: 1700000000, grill_temperature: 225 }]) }
    clientFactory.createClient.mockReturnValue(client)
    dbFactory.createDb.mockResolvedValue(db)
    app = appFactory.create()
  })

  describe('API routes', () => {
    test('GET /api/status returns grill status as JSON', async () => {
      const res = await request(app).get('/api/status')
      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toMatch(/application\/json/)
      expect(res.body).toEqual({ isOn: true, currentGrillTemp: 225 })
    })

    test.each([
      ['/api/powertoggle', 'powerToggleGrill'],
      ['/api/poweron', 'powerOnGrill'],
      ['/api/poweroff', 'powerOffGrill']
    ])('PUT %s calls %s and returns 200', async (path, method) => {
      const res = await request(app).put(path)
      expect(res.status).toBe(200)
      expect(res.text).toBe('OK')
      expect(client[method]).toHaveBeenCalledTimes(1)
    })

    test.each([
      ['/api/temperature/grill/225', 'setGrillTemp'],
      ['/api/temperature/food/165', 'setFoodTemp']
    ])('PUT %s passes the route param to %s', async (path, method) => {
      const res = await request(app).put(path)
      expect(res.status).toBe(200)
      expect(client[method]).toHaveBeenCalledWith(path.split('/').pop())
    })

    test('GET /api/temperature/history queries rows since the given epoch', async () => {
      const res = await request(app).get('/api/temperature/history?since=1700000000')
      expect(res.status).toBe(200)
      expect(res.body).toEqual([{ timestamp: 1700000000, grill_temperature: 225 }])
      expect(db.all).toHaveBeenCalledWith(expect.stringContaining('FROM temperature_log'), 1700000000)
    })

    test('ignores a JSON body on command routes', async () => {
      const res = await request(app).put('/api/poweron').send({ unexpected: true })
      expect(res.status).toBe(200)
    })
  })

  describe('error handling', () => {
    test('InvalidCommand from the grill client maps to 400 with its message', async () => {
      client.setGrillTemp.mockRejectedValue(new Errors.InvalidCommand('Cannot set grill temperature when the gill is off!'))
      const res = await request(app).put('/api/temperature/grill/225')
      expect(res.status).toBe(400)
      expect(res.text).toBe('Cannot set grill temperature when the gill is off!')
    })

    test('other errors map to 500 with the error message', async () => {
      client.getGrillStatus.mockRejectedValue(new Error('No response from Grill'))
      const res = await request(app).get('/api/status')
      expect(res.status).toBe(500)
      expect(res.text).toBe('No response from Grill')
    })

    test('unknown routes return 404', async () => {
      const res = await request(app).get('/api/nope')
      expect(res.status).toBe(404)
      expect(res.text).toBe('Not Found')
    })

    test('wrong method on a known route returns 404', async () => {
      const res = await request(app).get('/api/poweron')
      expect(res.status).toBe(404)
    })

    test('malformed JSON body returns 400', async () => {
      const res = await request(app)
        .put('/api/poweron')
        .set('Content-Type', 'application/json')
        .send('{not json')
      expect(res.status).toBe(400)
      expect(client.powerOnGrill).not.toHaveBeenCalled()
    })
  })

  describe('static files and middleware', () => {
    test('serves alert sounds from public/', async () => {
      const res = await request(app).get('/alerts/targetGrillTempReached.mp3')
      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toBe('audio/mpeg')
    })

    test('does not serve files outside public/ via path traversal', async () => {
      const res = await request(app).get('/%2e%2e/config/default.json')
      expect(res.status).not.toBe(200)
      expect(res.text).not.toMatch(/webhookUrl/)
    })

    test('sends CORS headers', async () => {
      const res = await request(app).get('/api/status').set('Origin', 'http://example.com')
      expect(res.headers['access-control-allow-origin']).toBe('*')
    })
  })
})
