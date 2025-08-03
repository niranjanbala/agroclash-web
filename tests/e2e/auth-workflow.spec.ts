import { test, expect } from '@playwright/test';

test.describe('Authentication Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Set up mock environment
    await page.addInitScript(() => {
      window.localStorage.setItem('USE_MOCK_AUTH', 'true');
    });
  });

  test('should complete full registration flow', async ({ page }) => {
    await page.goto('/');
    
    // Click sign up button
    await page.click('[data-testid="sign-up-button"]');
    
    // Fill registration form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="name-input"]', 'Test Farmer');
    await page.fill('[data-testid="location-input"]', 'Test Location');
    
    // Submit registration
    await page.click('[data-testid="register-submit"]');
    
    // Verify OTP screen appears
    await expect(page.locator('[data-testid="otp-form"]')).toBeVisible();
    
    // Enter mock OTP
    await page.fill('[data-testid="otp-input"]', '123456');
    await page.click('[data-testid="verify-otp"]');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="farm-dashboard"]')).toBeVisible();
  });

  test('should handle login flow', async ({ page }) => {
    await page.goto('/');
    
    // Click login button
    await page.click('[data-testid="login-button"]');
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', 'existing@example.com');
    await page.click('[data-testid="login-submit"]');
    
    // Verify OTP screen
    await expect(page.locator('[data-testid="otp-form"]')).toBeVisible();
    
    // Enter OTP and verify
    await page.fill('[data-testid="otp-input"]', '123456');
    await page.click('[data-testid="verify-otp"]');
    
    // Verify dashboard access
    await expect(page).toHaveURL('/dashboard');
  });

  test('should handle authentication errors', async ({ page }) => {
    await page.goto('/');
    
    // Try invalid email
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.click('[data-testid="login-submit"]');
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid email');
  });
});