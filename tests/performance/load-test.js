import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 10 }, // Stay at 10 users
    { duration: '2m', target: 50 }, // Ramp up to 50 users
    { duration: '5m', target: 50 }, // Stay at 50 users
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'], // Error rate must be below 10%
    errors: ['rate<0.1'],
  },
};

const BASE_URL = 'http://localhost:3000';

// Mock authentication token
const AUTH_TOKEN = 'mock-jwt-token';

export default function () {
  // Test dashboard load
  let response = http.get(`${BASE_URL}/dashboard`, {
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  check(response, {
    'dashboard loads successfully': (r) => r.status === 200,
    'dashboard response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  // Test plot data loading
  response = http.get(`${BASE_URL}/api/plots`, {
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  check(response, {
    'plots API responds': (r) => r.status === 200,
    'plots data is valid JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    },
  }) || errorRate.add(1);

  sleep(1);

  // Test crop data loading
  response = http.get(`${BASE_URL}/api/crops`, {
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  check(response, {
    'crops API responds': (r) => r.status === 200,
    'crops response time < 300ms': (r) => r.timings.duration < 300,
  }) || errorRate.add(1);

  sleep(1);

  // Test XP data loading
  response = http.get(`${BASE_URL}/api/xp`, {
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  check(response, {
    'XP API responds': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(2);
}

// Test scenario for large dataset handling
export function largeDatasetTest() {
  // Test with large number of plots
  const plotsResponse = http.get(`${BASE_URL}/api/plots?limit=1000`, {
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
    },
  });

  check(plotsResponse, {
    'large plots dataset loads': (r) => r.status === 200,
    'large dataset response time < 2s': (r) => r.timings.duration < 2000,
  });

  // Test with large crop history
  const cropsResponse = http.get(`${BASE_URL}/api/crops/history?limit=5000`, {
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
    },
  });

  check(cropsResponse, {
    'large crop history loads': (r) => r.status === 200,
    'crop history response time < 3s': (r) => r.timings.duration < 3000,
  });
}