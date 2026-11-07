import { render, screen } from '@testing-library/react'
import { App } from './App'

test('renders the shell title', () => {
  render(<App />)
  expect(screen.getByText('SHIMACORD')).toBeInTheDocument()
})
