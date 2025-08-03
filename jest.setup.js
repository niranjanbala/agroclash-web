import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.USE_MOCK_WEATHER = 'true'
process.env.USE_MOCK_MARKET = 'true'
process.env.USE_MOCK_PEST = 'true'
process.env.USE_MOCK_NOTIFICATIONS = 'true'

// Mock Leaflet for tests
global.L = {
  map: jest.fn(() => ({
    setView: jest.fn(),
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
  })),
  tileLayer: jest.fn(() => ({
    addTo: jest.fn(),
  })),
  polygon: jest.fn(() => ({
    addTo: jest.fn(),
    setStyle: jest.fn(),
  })),
}