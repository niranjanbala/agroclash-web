import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MarketplaceDashboard } from '../MarketplaceDashboard'
import { ServiceFactory } from '@/lib/services/factory'

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

// Mock the service factory
jest.mock('@/lib/services/factory', () => ({
  ServiceFactory: {
    getMarketService: jest.fn(() => ({
      getPrices: jest.fn().mockResolvedValue([
        {
          crop_name: 'Tomatoes',
          variety: 'Cherry',
          price_per_kg: 3.50,
          currency: 'USD',
          market_location: 'Central Market',
          date: '2024-01-15',
          trend: 'up'
        },
        {
          crop_name: 'Corn',
          variety: 'Sweet',
          price_per_kg: 0.85,
          currency: 'USD',
          market_location: 'Farmers Market',
          date: '2024-01-15',
          trend: 'stable'
        }
      ]),
      getMarketTrends: jest.fn().mockResolvedValue([]),
      getRecommendations: jest.fn().mockResolvedValue([
        {
          cropName: 'Tomatoes',
          reason: 'High demand expected',
          expectedPrice: 3.75
        }
      ])
    }))
  }
}))

describe('MarketplaceDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders marketplace dashboard with header and tabs', async () => {
    render(<MarketplaceDashboard />)
    
    expect(screen.getByText('Marketplace')).toBeInTheDocument()
    expect(screen.getByText('Buy and sell crops, track market prices, and get trading insights')).toBeInTheDocument()
    
    // Check tabs
    expect(screen.getByText('Market Prices')).toBeInTheDocument()
    expect(screen.getByText('Sell Crops')).toBeInTheDocument()
    expect(screen.getByText('Price Trends')).toBeInTheDocument()
    expect(screen.getByText('Recommendations')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
    expect(screen.getByText('My Listings')).toBeInTheDocument()
  })

  it('loads and displays market data', async () => {
    render(<MarketplaceDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument() // Active listings count
    })
    
    // Check if market service was called
    const marketService = ServiceFactory.getMarketService()
    expect(marketService.getPrices).toHaveBeenCalled()
  })

  it('handles search functionality', async () => {
    render(<MarketplaceDashboard />)
    
    const searchInput = screen.getByPlaceholderText('Search crops (e.g., tomatoes, corn, wheat)...')
    
    fireEvent.change(searchInput, { target: { value: 'tomatoes' } })
    
    await waitFor(() => {
      const marketService = ServiceFactory.getMarketService()
      expect(marketService.getPrices).toHaveBeenCalledWith('tomatoes')
    })
  })

  it('displays market summary statistics', async () => {
    render(<MarketplaceDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Active Listings')).toBeInTheDocument()
      expect(screen.getByText('Avg Price/kg')).toBeInTheDocument()
      expect(screen.getByText('Trending Up')).toBeInTheDocument()
      expect(screen.getByText('Trending Down')).toBeInTheDocument()
    })
  })

  it('switches between tabs correctly', async () => {
    render(<MarketplaceDashboard />)
    
    // Click on trends tab
    fireEvent.click(screen.getByText('Price Trends'))
    
    // Should show trends content (this would depend on MarketTrends component implementation)
    await waitFor(() => {
      // The active tab should change
      expect(screen.getByText('Price Trends')).toHaveClass('text-green-600')
    })
  })

  it('handles refresh functionality', async () => {
    render(<MarketplaceDashboard />)
    
    const refreshButton = screen.getByText('🔄 Refresh')
    fireEvent.click(refreshButton)
    
    await waitFor(() => {
      const marketService = ServiceFactory.getMarketService()
      expect(marketService.getPrices).toHaveBeenCalledTimes(2) // Initial load + refresh
    })
  })

  it('displays error state when market data fails to load', async () => {
    // Mock service to throw error
    const mockMarketService = {
      getPrices: jest.fn().mockRejectedValue(new Error('Network error')),
      getMarketTrends: jest.fn(),
      getRecommendations: jest.fn()
    }
    
    jest.mocked(ServiceFactory.getMarketService).mockReturnValue(mockMarketService)
    
    render(<MarketplaceDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('shows loading state initially', () => {
    render(<MarketplaceDashboard />)
    
    expect(screen.getByText('Updating...')).toBeInTheDocument()
  })

  it('calculates average price correctly', async () => {
    render(<MarketplaceDashboard />)
    
    await waitFor(() => {
      // Average of 3.50 and 0.85 should be 2.18 (rounded)
      expect(screen.getByText('$2.18')).toBeInTheDocument()
    })
  })

  it('shows correct trend counts', async () => {
    render(<MarketplaceDashboard />)
    
    await waitFor(() => {
      // Based on mock data: 1 trending up, 0 trending down
      const trendingUpElements = screen.getAllByText('1')
      const trendingDownElements = screen.getAllByText('0')
      
      expect(trendingUpElements.length).toBeGreaterThan(0)
      expect(trendingDownElements.length).toBeGreaterThan(0)
    })
  })
})

describe('MarketplaceDashboard Integration', () => {
  it('integrates with all marketplace components', async () => {
    render(<MarketplaceDashboard />)
    
    // Test each tab integration
    const tabs = ['Market Prices', 'Sell Crops', 'Price Trends', 'Recommendations', 'Analytics', 'My Listings']
    
    for (const tabName of tabs) {
      fireEvent.click(screen.getByText(tabName))
      await waitFor(() => {
        expect(screen.getByText(tabName)).toHaveClass('text-green-600')
      })
    }
  })

  it('maintains state across tab switches', async () => {
    render(<MarketplaceDashboard />)
    
    // Enter search query
    const searchInput = screen.getByPlaceholderText('Search crops (e.g., tomatoes, corn, wheat)...')
    fireEvent.change(searchInput, { target: { value: 'tomatoes' } })
    
    // Switch tabs
    fireEvent.click(screen.getByText('Price Trends'))
    fireEvent.click(screen.getByText('Market Prices'))
    
    // Search query should be maintained
    expect(searchInput).toHaveValue('tomatoes')
  })
})