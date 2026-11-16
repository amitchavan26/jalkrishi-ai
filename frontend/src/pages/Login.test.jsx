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
      post: vi.fn(),
      get: vi.fn()
    }
  }
})

import { api } from '../api'

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('logs in and stores the token', async () => {
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
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() => expect(screen.getByText('Home')).toBeInTheDocument())
    
    expect(api.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'a@b.com',
      password: 'password123'
    })
    expect(localStorage.getItem('jk_token')).toBe('abc123')
  })

  it('shows the server error', async () => {
    api.post.mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } }
    })
    
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    )

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Email'), 'a@b.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() => expect(screen.getByText('Invalid credentials')).toBeInTheDocument())
  })
})