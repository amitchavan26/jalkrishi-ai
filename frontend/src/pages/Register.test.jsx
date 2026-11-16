import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Register from './Register'

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

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('registersAndGoesToLogin', async () => {
    api.post.mockResolvedValue({ data: {} })

    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    )

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Name'), 'Amit')
    await user.type(screen.getByLabelText('Email'), 'a@b.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Register' }))

    await waitFor(() => expect(screen.getByText('Login page')).toBeInTheDocument())
    expect(api.post).toHaveBeenCalledWith('/api/auth/register', {
      name: 'Amit',
      email: 'a@b.com',
      password: 'password123'
    })
  })

  it('blocksShortPassword', async () => {
    api.post.mockResolvedValue({ data: {} })

    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    )

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Name'), 'Amit')
    await user.type(screen.getByLabelText('Email'), 'a@b.com')
    await user.type(screen.getByLabelText('Password'), 'short')
    await user.click(screen.getByRole('button', { name: 'Register' }))

    await waitFor(() => expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument())
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument()
    expect(api.post).not.toHaveBeenCalled()
  })

  it('showsServerError', async () => {
    api.post.mockRejectedValue({
      response: { data: { message: 'Email already registered' } }
    })

    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    )

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Name'), 'Amit')
    await user.type(screen.getByLabelText('Email'), 'a@b.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Register' }))

    await waitFor(() => expect(screen.getByText('Email already registered')).toBeInTheDocument())
  })
})