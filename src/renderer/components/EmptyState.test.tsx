import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmptyState } from './EmptyState'

test('shows no looks yet and the create button calls onCreate', async () => {
  const onCreate = vi.fn()
  render(<EmptyState onCreate={onCreate} />)
  expect(screen.getByText(/no looks yet/i)).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /create/i }))
  expect(onCreate).toHaveBeenCalledTimes(1)
})
