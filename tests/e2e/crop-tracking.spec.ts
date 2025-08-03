import { test, expect } from '@playwright/test';

test.describe('Crop Tracking Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { id: 'test-user-id', email: 'test@example.com' }
      }));
    });
    
    await page.goto('/dashboard');
  });

  test('should track crop lifecycle', async ({ page }) => {
    // Navigate to crop tracker
    await page.click('[data-testid="crop-tracker-link"]');
    await expect(page).toHaveURL('/crops');
    
    // Verify crop timeline is visible
    await expect(page.locator('[data-testid="crop-timeline"]')).toBeVisible();
    
    // Check crop status
    await expect(page.locator('[data-testid="crop-status"]')).toBeVisible();
    
    // Update crop status
    await page.click('[data-testid="update-crop-status"]');
    await page.selectOption('[data-testid="status-select"]', 'flowering');
    await page.click('[data-testid="save-status"]');
    
    // Verify XP award notification
    await expect(page.locator('[data-testid="xp-notification"]')).toBeVisible();
    await expect(page.locator('[data-testid="xp-notification"]')).toContainText('XP awarded');
  });

  test('should show crop milestones and alerts', async ({ page }) => {
    await page.goto('/crops');
    
    // Check for milestone alerts
    await expect(page.locator('[data-testid="milestone-alerts"]')).toBeVisible();
    
    // Click on a milestone
    await page.click('[data-testid="milestone-item"]:first-child');
    
    // Verify milestone details
    await expect(page.locator('[data-testid="milestone-details"]')).toBeVisible();
    
    // Mark milestone as completed
    await page.click('[data-testid="complete-milestone"]');
    
    // Verify XP award
    await expect(page.locator('[data-testid="xp-award"]')).toBeVisible();
  });

  test('should display crop statistics', async ({ page }) => {
    await page.goto('/crops');
    
    // Navigate to crop stats
    await page.click('[data-testid="crop-stats-tab"]');
    
    // Verify statistics are displayed
    await expect(page.locator('[data-testid="total-crops"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-crops"]')).toBeVisible();
    await expect(page.locator('[data-testid="harvest-ready"]')).toBeVisible();
    
    // Check growth progress chart
    await expect(page.locator('[data-testid="growth-chart"]')).toBeVisible();
  });
});