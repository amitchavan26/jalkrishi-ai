import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Login from './Login'

vi.mock('../api', async () => {
  const actual = await vi.importActual('../api')
  return {
    ...actual,
    api: {
      post: vi.fn()
    }
  }
})

import { api } from '../api'

describe('Login extra', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('showsFriendlyRateLimitMessage', async () => {
    api.post.mockRejectedValue({
      response: { status: 429, data: { message: 'x' } }
    })

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    )

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Email'), 'a@b.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() => expect(screen.getByText('Too many attempts. Please wait a minute and try again.')).toBeInTheDocument())
  })

  it('passwordToggleShowsAndHides', async () => {
    api.post.mockResolvedValue({ data: { token: 'abc123' } })

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    )

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Email'), 'a@b.com')
    await user.type(screen.getByLabelText('Password'), 'secret123')

    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Show password' }))
    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('validatesEmailBeforeSubmitting', async () => {
    api.post.mockResolvedValue({ data: { token: 'abc123' } })

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    )

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() => expect(screen.getByText('Enter a valid email address')).toBeInTheDocument())
    expect(api.post).not.toHaveBeenCalled()
  })
})