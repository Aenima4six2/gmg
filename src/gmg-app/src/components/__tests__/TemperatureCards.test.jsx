import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GrillTemperature from '../GrillTemperature'
import FoodTemperature from '../FoodTemperature'

// GrillTemperature and FoodTemperature share the same behaviour with
// different prop names and labels, so run the same suite against both.
describe.each([
  { name: 'GrillTemperature', Component: GrillTemperature, current: 'currentGrillTemp', desired: 'desiredGrillTemp', button: 'Set Grill Temperature' },
  { name: 'FoodTemperature', Component: FoodTemperature, current: 'currentFoodTemp', desired: 'desiredFoodTemp', button: 'Set Food Temperature' }
])('$name', ({ Component, current, desired, button }) => {
  const renderCard = (props = {}) => render(
    <Component {...{ [current]: 180, [desired]: 225, isEnabled: true, onSubmit: vi.fn(), ...props }} />
  )

  test('shows current and desired temperatures', () => {
    renderCard()
    expect(screen.getByText('Current: 180 ℉')).toBeInTheDocument()
    expect(screen.getByText('Desired: 225 ℉')).toBeInTheDocument()
  })

  test('shows "Not set" when there is no desired temperature', () => {
    renderCard({ [desired]: 0 })
    expect(screen.getByText('Desired: Not set')).toBeInTheDocument()
  })

  test('disables the set button when not enabled', () => {
    renderCard({ isEnabled: false })
    expect(screen.getByRole('button', { name: button })).toBeDisabled()
  })

  test('submits the entered temperature', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderCard({ onSubmit })

    await user.click(screen.getByRole('button', { name: button }))
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByRole('textbox'), '250')
    await user.click(within(dialog).getByRole('button', { name: 'Set' }))

    expect(onSubmit).toHaveBeenCalledWith('250')
  })

  test.each([
    ['abc', 'Desired temperature must be a number!'],
    ['501', 'Desired temperature must be less than 500 ℉!']
  ])('rejects %s with a validation message', async (input, message) => {
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: button }))
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByRole('textbox'), input)

    expect(within(dialog).getByText(message)).toBeInTheDocument()
  })

  test('cancel closes the dialog without submitting', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderCard({ onSubmit })

    await user.click(screen.getByRole('button', { name: button }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    expect(onSubmit).not.toHaveBeenCalled()
  })
})
