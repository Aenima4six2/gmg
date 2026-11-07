import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomeControls from '../HomeControls'

// The power button is the first icon button in the toolbar
const powerButton = () => screen.getByTestId('PowerSettingsNewIcon').closest('button')

describe('HomeControls', () => {
  test('power button is disabled when the grill is not connected', () => {
    render(<HomeControls grillConnected={false} loading={false} />)
    expect(powerButton()).toBeDisabled()
  })

  test('power button is disabled while fan mode is active', () => {
    render(<HomeControls grillConnected fanModeActive loading={false} />)
    expect(powerButton()).toBeDisabled()
  })

  test('power button calls onPowerTouchTap when connected', async () => {
    const user = userEvent.setup()
    const onPowerTouchTap = vi.fn()
    render(<HomeControls grillConnected loading={false} onPowerTouchTap={onPowerTouchTap} />)

    await user.click(powerButton())

    expect(onPowerTouchTap).toHaveBeenCalledTimes(1)
  })

  test('shows a progress bar while loading', () => {
    render(<HomeControls grillConnected loading />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  test('hides the progress bar when not loading', () => {
    render(<HomeControls grillConnected loading={false} />)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })
})
