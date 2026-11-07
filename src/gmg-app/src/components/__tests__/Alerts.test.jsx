import React from 'react'
import { render, screen, act } from '@testing-library/react'

// Capture the socket.io event handlers Home registers so tests can emit events.
const handlers = {}
vi.mock('socket.io-client', () => ({
  default: () => ({
    on: (event, fn) => { handlers[event] = fn },
    removeAllListeners: () => {},
    disconnect: () => {}
  })
}))

import App from '../App'

describe('alerts', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test.each([
    ['info', 'Target Food Temperature Reached', 'Food temperature has reached target temperature of 165'],
    ['warning', 'Low Pellets', 'Pellet level is low'],
    ['error', 'Grill Error', 'Something went wrong']
  ])('shows a %s alert from the server as a notification', async (level, name, reason) => {
    render(<App />)
    act(() => handlers.alert({ name, reason, level }))
    expect(await screen.findByText(`${name}: ${reason}`)).toBeInTheDocument()
  })
})
