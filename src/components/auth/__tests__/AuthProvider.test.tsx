import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthProvider'
import { SupabaseAuthService } from '@/lib/services/auth.service'

// Mock the auth service
jest.mock('@/lib/services/auth.service')

const MockedAuthService = SupabaseAuthService as jest.MockedClass<typeof SupabaseAuthService>

// Test component that uses the auth context
function TestComponent() {
  const { user, loading, signIn, signOut } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div data-testid="user-status">
        {user ? `Logged in as ${user.name}` : 'Not logged in'}
      </div>
      <button onClick={() => signIn('test@example.com', 'password')}>
        Sign In
      </button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}

describe('AuthProvider', () => {
  let mockAuthService: jest.Mocked<SupabaseAuthService>

  beforeEach(() => {
    mockAuthService = {
      getCurrentUser: jest.fn(),
      onAuthStateChange: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn(),
      updateProfile: jest.fn(),
      sendOTP: jest.fn(),
      verifyOTP: jest.fn()
    } as any

    MockedAuthService.mockImplementation(() => mockAuthService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should provide auth context to children', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue(null)
    mockAuthService.onAuthStateChange.mockReturnValue(() => {})

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Should show loading initially
    expect(screen.getByText('Loading...')).toBeInTheDocument()

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in')
    })
  })

  it('should handle user authentication state', async () => {
    const mockUser = {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      xp: 100,
      level: 2,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    mockAuthService.getCurrentUser.mockResolvedValue(mockUser)
    mockAuthService.onAuthStateChange.mockReturnValue(() => {})

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as Test User')
    })
  })

  it('should handle sign in', async () => {
    const mockUser = {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      xp: 100,
      level: 2,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    mockAuthService.getCurrentUser.mockResolvedValue(null)
    mockAuthService.onAuthStateChange.mockReturnValue(() => {})
    mockAuthService.signIn.mockResolvedValue(mockUser)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in')
    })

    // Click sign in button
    const signInButton = screen.getByText('Sign In')
    signInButton.click()

    await waitFor(() => {
      expect(mockAuthService.signIn).toHaveBeenCalledWith('test@example.com', 'password')
    })
  })

  it('should handle sign out', async () => {
    const mockUser = {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      xp: 100,
      level: 2,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    mockAuthService.getCurrentUser.mockResolvedValue(mockUser)
    mockAuthService.onAuthStateChange.mockReturnValue(() => {})
    mockAuthService.signOut.mockResolvedValue()

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Wait for user to be loaded
    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as Test User')
    })

    // Click sign out button
    const signOutButton = screen.getByText('Sign Out')
    signOutButton.click()

    await waitFor(() => {
      expect(mockAuthService.signOut).toHaveBeenCalled()
    })
  })

  it('should handle auth state changes', async () => {
    let authStateCallback: (user: any) => void = () => {}

    mockAuthService.getCurrentUser.mockResolvedValue(null)
    mockAuthService.onAuthStateChange.mockImplementation((callback) => {
      authStateCallback = callback
      return () => {}
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in')
    })

    // Simulate auth state change
    const mockUser = {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      xp: 100,
      level: 2,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    authStateCallback(mockUser)

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as Test User')
    })
  })

  it('should throw error when useAuth is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')

    consoleSpy.mockRestore()
  })

  it('should handle authentication errors gracefully', async () => {
    mockAuthService.getCurrentUser.mockRejectedValue(new Error('Auth error'))
    mockAuthService.onAuthStateChange.mockReturnValue(() => {})

    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in')
    })

    consoleSpy.mockRestore()
  })
})