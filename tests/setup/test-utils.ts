import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// Mock Supabase client for tests
export const mockSupabaseClient = {
  auth: {
    signUp: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } }))
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    then: jest.fn()
  })),
  channel: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn()
  }))
};

// Mock data generators
export const generateMockPlot = (overrides = {}) => ({
  id: 'mock-plot-id',
  user_id: 'mock-user-id',
  name: 'Test Plot',
  geometry: {
    type: 'Polygon',
    coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
  },
  area_hectares: 1.0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

export const generateMockCrop = (overrides = {}) => ({
  id: 'mock-crop-id',
  plot_id: 'mock-plot-id',
  name: 'Tomato',
  variety: 'Cherry',
  sown_date: '2024-01-15',
  expected_harvest_date: '2024-04-15',
  status: 'growing',
  growth_stage: 'flowering',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

export const generateMockUser = (overrides = {}) => ({
  id: 'mock-user-id',
  email: 'test@example.com',
  name: 'Test User',
  location: { lat: 40.7128, lng: -74.0060 },
  xp: 1250,
  level: 5,
  clan_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

export const generateMockXPLog = (overrides = {}) => ({
  id: 'mock-xp-log-id',
  user_id: 'mock-user-id',
  action_type: 'crop_watered',
  xp_awarded: 10,
  description: 'Watered tomato crop',
  created_at: new Date().toISOString(),
  ...overrides
});

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div data-testid="test-wrapper">
      {children}
    </div>
  );
};

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: TestWrapper, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Mock environment setup
export const setupTestEnvironment = () => {
  // Mock environment variables
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  process.env.USE_MOCK_WEATHER = 'true';
  process.env.USE_MOCK_MARKET = 'true';
  process.env.USE_MOCK_PEST = 'true';
  process.env.USE_MOCK_NOTIFICATIONS = 'true';

  // Mock global objects
  global.fetch = jest.fn();
  global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn()
  };

  // Mock geolocation
  global.navigator.geolocation = {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn()
  };
};

// Performance testing utilities
export const measureRenderTime = async (renderFn: () => void): Promise<number> => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
};

export const waitForAsyncUpdates = (): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, 0));
};