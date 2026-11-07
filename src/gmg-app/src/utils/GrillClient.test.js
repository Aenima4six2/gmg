import GrillClient from './GrillClient'

const okResponse = (json) => ({ ok: true, json: vi.fn().mockResolvedValue(json), text: vi.fn() })
const errorResponse = (body) => ({ ok: false, text: vi.fn().mockResolvedValue(body) })

describe('GrillClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test.each([
    ['http://grill.local/', 'http://grill.local'],
    ['http://grill.local\\', 'http://grill.local'],
    ['http://grill.local', 'http://grill.local']
  ])('normalizes base address %s', (input, expected) => {
    expect(new GrillClient(input).apiBaseAddress).toBe(expected)
  })

  test.each([
    ['powerToggle', [], '/api/powertoggle'],
    ['setDesiredGrillTemp', [225], '/api/temperature/grill/225'],
    ['setDesiredFoodTemp', [165], '/api/temperature/food/165']
  ])('%s sends PUT to %s', async (method, args, path) => {
    fetch.mockResolvedValue(okResponse())
    await new GrillClient('http://grill.local/')[method](...args)
    expect(fetch).toHaveBeenCalledWith(`http://grill.local${path}`, { method: 'PUT' })
  })

  test.each([
    ['powerToggle', []],
    ['setDesiredGrillTemp', [225]],
    ['setDesiredFoodTemp', [165]],
    ['getTemperatureHistory', [0]]
  ])('%s throws the response body when the request fails', async (method, args) => {
    fetch.mockResolvedValue(errorResponse('Cannot set grill temperature when the gill is off!'))
    await expect(new GrillClient('http://grill.local')[method](...args))
      .rejects.toThrow('Cannot set grill temperature when the gill is off!')
  })

  test('getTemperatureHistory requests rows since the given epoch and returns them', async () => {
    const rows = [{ timestamp: 1700000000, grill_temperature: 225, food_temperature: 150 }]
    fetch.mockResolvedValue(okResponse(rows))

    const result = await new GrillClient('http://grill.local').getTemperatureHistory(1700000000)

    expect(fetch).toHaveBeenCalledWith('http://grill.local/api/temperature/history?since=1700000000')
    expect(result).toEqual(rows)
  })
})
