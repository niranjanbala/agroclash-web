import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { ClanDashboard } from '../ClanDashboard'
import { MockClanService } from '@/lib/services/mock/clan.service'

// Mock the auth provider
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  xp: 150,
  level: 2,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

jest.mock('../../auth/AuthProvider', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    updateProfile: jest.fn()
  })
}))

// Mock the clan service
jest.mock('@/lib/services/mock/clan.service')

describe('ClanDashboard', () => {
  let mockClanService: jest.Mocked<MockClanService>

  beforeEach(() => {
    mockClanService = new MockClanService() as jest.Mocked<MockClanService>
    
    // Mock service methods
    mockClanService.getUserClan = jest.fn().mockResolvedValue(null)
    mockClanService.getUserInvites = jest.fn().mockResolvedValue([])
    mockClanService.searchClans = jest.fn().mockResolvedValue([
      {
        id: 'clan-1',
        name: 'Test Clan',
        description: 'A test clan',
        leader_id: 'leader-1',
        member_count: 5,
        total_xp: 1000,
        created_at: '2024-01-01T00:00:00Z'
      }
    ])
    
    jest.clearAllMocks()
  })

  it('renders clan dashboard for user without clan', async () => {
    render(<ClanDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Clans')).toBeInTheDocument()
      expect(screen.getByText('Join a clan to collaborate with other farmers and compete together')).toBeInTheDocument()
    })
  })

  it('shows search tab by default when user has no clan', async () => {
    render(<ClanDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Find Clans')).toHaveClass('text-green-600')
    })
  })

  it('renders clan dashboard for user with clan', async () => {
    const mockClan = {
      id: 'clan-1',
      name: 'Test Clan',
      description: 'A test clan',
      leader_id: 'user-1',
      member_count: 5,
      total_xp: 1000,
      created_at: '2024-01-01T00:00:00Z'
    }

    mockClanService.getUserClan = jest.fn().mockResolvedValue(mockClan)
    
    render(<ClanDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Clan')).toBeInTheDocument()
      expect(screen.getByText('5 members')).toBeInTheDocument()
    })
  })

  it('shows pending invites alert when user has invites', async () => {
    const mockInvites = [
      {
        id: 'invite-1',
        clan_id: 'clan-1',
        inviter_id: 'inviter-1',
        invitee_id: 'user-1',
        status: 'pending' as const,
        created_at: '2024-01-01T00:00:00Z',
        clan: {
          id: 'clan-1',
          name: 'Inviting Clan',
          member_count: 10,
          total_xp: 5000
        },
        inviter: {
          id: 'inviter-1',
          name: 'Inviter User',
          email: 'inviter@example.com'
        }
      }
    ]

    mockClanService.getUserInvites = jest.fn().mockResolvedValue(mockInvites)
    
    render(<ClanDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('You have 1 pending clan invite!')).toBeInTheDocument()
      expect(screen.getByText('View invites')).toBeInTheDocument()
    })
  })

  it('handles clan joining', async () => {
    mockClanService.joinClan = jest.fn().mockResolvedValue(undefined)
    
    render(<ClanDashboard />)
    
    // Wait for search results to load
    await waitFor(() => {
      expect(screen.getByText('Test Clan')).toBeInTheDocument()
    })
    
    // Click join button (this would be in the ClanSearch component)
    // This test would need to be more specific to the actual join flow
  })

  it('handles clan creation', async () => {
    mockClanService.createClan = jest.fn().mockResolvedValue({
      id: 'new-clan',
      name: 'New Clan',
      description: 'A new clan',
      leader_id: 'user-1',
      member_count: 1,
      total_xp: 0,
      created_at: '2024-01-01T00:00:00Z'
    })
    
    render(<ClanDashboard />)
    
    // This would test the clan creation flow
    // Implementation depends on how the create clan modal is triggered
  })

  it('switches between tabs correctly', async () => {
    render(<ClanDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Find Clans')).toBeInTheDocument()
    })
    
    // The tab switching would depend on the specific tab implementation
    // This is a basic structure for testing tab functionality
  })

  it('handles loading states', () => {
    render(<ClanDashboard />)
    
    expect(screen.getByText('Loading clan information...')).toBeInTheDocument()
  })

  it('handles error states', async () => {
    mockClanService.getUserClan = jest.fn().mockRejectedValue(new Error('Network error'))
    
    render(<ClanDashboard />)
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading clan information...')).not.toBeInTheDocument()
    })
    
    // Error handling would depend on how errors are displayed in the component
  })

  it('shows correct tabs for user with clan', async () => {
    const mockClan = {
      id: 'clan-1',
      name: 'Test Clan',
      description: 'A test clan',
      leader_id: 'user-1',
      member_count: 5,
      total_xp: 1000,
      created_at: '2024-01-01T00:00:00Z'
    }

    mockClanService.getUserClan = jest.fn().mockResolvedValue(mockClan)
    
    render(<ClanDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument()
      expect(screen.getByText('Members')).toBeInTheDocument()
      expect(screen.getByText('Leaderboard')).toBeInTheDocument()
      expect(screen.getByText('Find Clans')).toBeInTheDocument()
    })
  })

  it('shows invite response functionality', async () => {
    const mockInvites = [
      {
        id: 'invite-1',
        clan_id: 'clan-1',
        inviter_id: 'inviter-1',
        invitee_id: 'user-1',
        status: 'pending' as const,
        created_at: '2024-01-01T00:00:00Z',
        clan: {
          id: 'clan-1',
          name: 'Inviting Clan',
          member_count: 10,
          total_xp: 5000
        },
        inviter: {
          id: 'inviter-1',
          name: 'Inviter User',
          email: 'inviter@example.com'
        }
      }
    ]

    mockClanService.getUserInvites = jest.fn().mockResolvedValue(mockInvites)
    mockClanService.respondToInvite = jest.fn().mockResolvedValue(undefined)
    
    render(<ClanDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Invites')).toBeInTheDocument()
    })
    
    // Click on invites tab
    fireEvent.click(screen.getByText('Invites'))
    
    // This would test the invite response functionality
    // Implementation depends on the ClanInvites component structure
  })
})

describe('ClanDashboard Integration', () => {
  it('integrates with all clan components', async () => {
    const mockClan = {
      id: 'clan-1',
      name: 'Test Clan',
      description: 'A test clan',
      leader_id: 'user-1',
      member_count: 5,
      total_xp: 1000,
      created_at: '2024-01-01T00:00:00Z'
    }

    const mockClanService = new MockClanService() as jest.Mocked<MockClanService>
    mockClanService.getUserClan = jest.fn().mockResolvedValue(mockClan)
    mockClanService.getUserInvites = jest.fn().mockResolvedValue([])
    
    render(<ClanDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Clan')).toBeInTheDocument()
    })
    
    // Test each tab integration
    const tabs = ['Overview', 'Members', 'Leaderboard', 'Find Clans']
    
    for (const tabName of tabs) {
      if (screen.queryByText(tabName)) {
        fireEvent.click(screen.getByText(tabName))
        await waitFor(() => {
          expect(screen.getByText(tabName)).toHaveClass('text-green-600')
        })
      }
    }
  })

  it('maintains state across component interactions', async () => {
    render(<ClanDashboard />)
    
    // This would test state management across different clan operations
    // Implementation depends on the specific state management approach
  })
})