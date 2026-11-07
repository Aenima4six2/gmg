const { execFileSync, spawnSync } = require('child_process')
const path = require('path')

// node-config reads the environment once at load time, so resolve it in a
// child process with a controlled environment.
const resolveConfig = (env) => JSON.parse(execFileSync(process.execPath, [
  '-e', 'process.stdout.write(JSON.stringify(require("config")))'
], {
  cwd: path.resolve(__dirname, '../..'),
  env: { PATH: process.env.PATH, ...env },
  encoding: 'utf8'
}))

describe('config from environment variables', () => {
  test('numeric settings are parsed as numbers', () => {
    const config = resolveConfig({
      GMG_GRILL_PORT: '9000',
      GMG_GRILL_TRIES: '3',
      GMG_GRILL_RETRYMS: '1500',
      GMG_STATUS_POLLING_INTERVAL: '2000',
      GMG_DB_MAX_SIZE_MB: '10'
    })

    expect(config.grill.port).toBe(9000)
    expect(config.grill.tries).toBe(3)
    expect(config.grill.retryMs).toBe(1500)
    expect(config.status.pollingInterval).toBe(2000)
    expect(config.db.maxSizeMb).toBe(10)
  })

  test('string settings are passed through', () => {
    const config = resolveConfig({
      GMG_GRILL_HOST: '192.168.1.50',
      GMG_DB_PATH: '/data',
      GMG_ALERTS_SLACK_WEBHOOKURL: 'https://hooks.slack.com/services/abc'
    })

    expect(config.grill.host).toBe('192.168.1.50')
    expect(config.db.path).toBe('/data')
    expect(config.alerts.slack.webhookUrl).toBe('https://hooks.slack.com/services/abc')
  })

  test('defaults apply when variables are unset', () => {
    const config = resolveConfig({})
    expect(config.grill.port).toBe(8080)
    expect(config.status.pollingInterval).toBe(5000)
  })

  test('NODE_ENV=production loads without a missing-config warning', () => {
    const { status, stderr } = spawnSync(process.execPath, ['-e', 'require("config")'], {
      cwd: path.resolve(__dirname, '../..'),
      env: { PATH: process.env.PATH, NODE_ENV: 'production' },
      encoding: 'utf8'
    })
    expect(status).toBe(0)
    expect(stderr).not.toMatch(/WARNING/)
  })
})
