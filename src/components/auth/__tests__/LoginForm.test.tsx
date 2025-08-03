import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../LoginForm'
import { useAuth } from '../AuthProvider'

// Mock the auth context
jest.mock('../AuthProvider', () => ({
  useAuth: jest.fn()
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('LoginForm', () => {
  const mockSignIn = jest.fn()
  const mockOnSuccess = jest.fn()
  const mockOnSwitchToSignUp = jest.fn()
  const mockOnSwitchToOTP = jest.fn()

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      signIn: mockSignIn,
      loading: false,
      user: null,
      signUp: jest.fn(),
      signOut: jest.fn(),
      updateProfile: jest.fn(),
      sendOTP: jest.fn(),
      verifyOTP: jest.fn()
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render login form with all fields', () => {
    render(<LoginForm />)

    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
    expect(screen.getByText('📱 Sign in with Phone')).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    await user.click(submitButton)

    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('should validate email format', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email Address')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)

    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('should validate password length', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, '123')
    await user.click(submitButton)

    expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('should submit form with valid data', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      xp: 0,
      level: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    })

    render(<LoginForm onSuccess={mockOnSuccess} />)

    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('should handle sign in errors', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Invalid credentials'
    mockSignIn.mockRejectedValue(new Error(errorMessage))

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('should show loading state during submission', async () => {
    const user = userEvent.setup()
    let resolveSignIn: (value: any) => void
    mockSignIn.mockReturnValue(new Promise(resolve => {
      resolveSignIn = resolve
    }))

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    expect(screen.getByText('Signing In...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()

    // Resolve the promise
    resolveSignIn!({
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      xp: 0,
      level: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    })

    await waitFor(() => {
      expect(screen.queryByText('Signing In...')).not.toBeInTheDocument()
    })
  })

  it('should clear field errors when user starts typing', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email Address')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    // Trigger validation error
    await user.click(submitButton)
    expect(screen.getByText('Email is required')).toBeInTheDocument()

    // Start typing to clear error
    await user.type(emailInput, 'test')
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
  })

  it('should call switch callbacks when buttons are clicked', async () => {
    const user = userEvent.setup()
    render(
      <LoginForm
        onSwitchToSignUp={mockOnSwitchToSignUp}
        onSwitchToOTP={mockOnSwitchToOTP}
      />
    )

    const signUpButton = screen.getByText('Sign up here')
    const otpButton = screen.getByText('📱 Sign in with Phone')

    await user.click(signUpButton)
    expect(mockOnSwitchToSignUp).toHaveBeenCalled()

    await user.click(otpButton)
    expect(mockOnSwitchToOTP).toHaveBeenCalled()
  })

  it('should disable form when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      signIn: mockSignIn,
      loading: true,
      user: null,
      signUp: jest.fn(),
      signOut: jest.fn(),
      updateProfile: jest.fn(),
      sendOTP: jest.fn(),
      verifyOTP: jest.fn()
    })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })
})