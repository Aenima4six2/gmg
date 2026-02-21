const EventEmitter = require('events')
const fs = require('fs')
const PersistenceManager = require('../../data/PersistenceManager')

jest.mock('../../data/index', () => ({
    createDb: jest.fn()
}))

const dbFactory = require('../../data/index')

function createMockDb() {
    return {
        run: jest.fn().mockResolvedValue(),
        get: jest.fn().mockResolvedValue({ count: 1000 }),
        close: jest.fn().mockResolvedValue()
    }
}

describe('PersistenceManager', () => {
    let pollingClient
    let mockDb

    beforeEach(() => {
        pollingClient = new EventEmitter()
        mockDb = createMockDb()
        dbFactory.createDb.mockResolvedValue(mockDb)
        jest.restoreAllMocks()
    })

    describe('cleanup', () => {
        test('triggers cleanup when db exceeds maxSizeMb after insert interval', async () => {
            const manager = new PersistenceManager({
                pollingClient,
                dbPath: '/tmp/test.db',
                maxSizeMb: 1
            })

            await manager.start()

            // Simulate file size over limit (2MB > 1MB)
            jest.spyOn(fs, 'statSync').mockReturnValue({ size: 2 * 1024 * 1024 })

            // Force insert count to trigger cleanup check
            manager._insertCount = 99

            await manager._onStatus({ isOn: true, currentGrillTemp: 250, currentFoodTemp: 100 })

            // Should have queried row count
            expect(mockDb.get).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM temperature_log')
            // Should delete oldest 10% (100 of 1000)
            expect(mockDb.run).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM temperature_log'),
                100
            )
            // Should VACUUM
            expect(mockDb.run).toHaveBeenCalledWith('VACUUM')
        })

        test('does not trigger cleanup when db is under maxSizeMb', async () => {
            const manager = new PersistenceManager({
                pollingClient,
                dbPath: '/tmp/test.db',
                maxSizeMb: 50
            })

            await manager.start()

            jest.spyOn(fs, 'statSync').mockReturnValue({ size: 10 * 1024 * 1024 })

            manager._insertCount = 99
            await manager._onStatus({ isOn: true, currentGrillTemp: 250, currentFoodTemp: 100 })

            // Should NOT have queried row count (no cleanup needed)
            expect(mockDb.get).not.toHaveBeenCalled()
        })

        test('does not run cleanup before reaching insert interval', async () => {
            const manager = new PersistenceManager({
                pollingClient,
                dbPath: '/tmp/test.db',
                maxSizeMb: 1
            })

            await manager.start()

            jest.spyOn(fs, 'statSync').mockReturnValue({ size: 2 * 1024 * 1024 })

            // Only 50 inserts, not at the 100 interval
            manager._insertCount = 50

            await manager._onStatus({ isOn: true, currentGrillTemp: 250, currentFoodTemp: 100 })

            expect(fs.statSync).not.toHaveBeenCalled()
        })

        test('handles missing db file gracefully', async () => {
            const manager = new PersistenceManager({
                pollingClient,
                dbPath: '/tmp/nonexistent.db',
                maxSizeMb: 1
            })

            await manager.start()

            jest.spyOn(fs, 'statSync').mockImplementation(() => {
                throw new Error('ENOENT')
            })

            manager._insertCount = 99

            // Should not throw
            await expect(
                manager._onStatus({ isOn: true, currentGrillTemp: 250, currentFoodTemp: 100 })
            ).resolves.toBeUndefined()
        })

        test('skips insert when grill is off', async () => {
            const manager = new PersistenceManager({
                pollingClient,
                dbPath: '/tmp/test.db',
                maxSizeMb: 1
            })

            await manager.start()
            // Clear the CREATE TABLE call
            mockDb.run.mockClear()

            await manager._onStatus({ isOn: false })

            expect(mockDb.run).not.toHaveBeenCalled()
            expect(manager._insertCount).toBe(0)
        })
    })
})
