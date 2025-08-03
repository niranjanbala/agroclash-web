import { test, expect } from '@playwright/test';

test.describe('Offline Functionality and Sync @offline', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock authentication
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { id: 'test-user-id', email: 'test@example.com' }
      }));
    });
  });

  test('should work offline with cached data', async ({ page, context }) => {
    // First, load the page online to cache data
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="farm-dashboard"]')).toBeVisible();
    
    // Wait for data to load and cache
    await page.waitForTimeout(2000);
    
    // Go offline
    await context.setOffline(true);
    
    // Reload page to test offline functionality
    await page.reload();
    
    // Verify offline indicator appears
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    
    // Verify cached data is still displayed
    await expect(page.locator('[data-testid="farm-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="plot-overview"]')).toBeVisible();
  });

  test('should queue actions when offline', async ({ page, context }) => {
    await page.goto('/dashboard');
    
    // Go offline
    await context.setOffline(true);
    
    // Perform actions that should be queued
    await page.click('[data-testid="water-crops-button"]');
    await page.click('[data-testid="update-crop-status"]');
    
    // Verify actions are queued
    const queuedActions = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('offline-queue') || '[]');
    });
    
    expect(queuedActions.length).toBeGreaterThan(0);
    
    // Verify queue indicator
    await expect(page.locator('[data-testid="sync-pending"]')).toBeVisible();
  });

  test('should sync queued actions when back online', async ({ page, context }) => {
    await page.goto('/dashboard');
    
    // Go offline and perform actions
    await context.setOffline(true);
    await page.click('[data-testid="water-crops-button"]');
    
    // Verify action is queued
    let queuedActions = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('offline-queue') || '[]');
    });
    expect(queuedActions.length).toBe(1);
    
    // Go back online
    await context.setOffline(false);
    
    // Wait for sync to complete
    await page.waitForTimeout(3000);
    
    // Verify queue is cleared
    queuedActions = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('offline-queue') || '[]');
    });
    expect(queuedActions.length).toBe(0);
    
    // Verify sync success notification
    await expect(page.locator('[data-testid="sync-success"]')).toBeVisible();
  });

  test('should handle sync conflicts gracefully', async ({ page, context }) => {
    await page.goto('/dashboard');
    
    // Simulate data that was modified on server while offline
    await page.evaluate(() => {
      // Mock server data that conflicts with local changes
      window.localStorage.setItem('conflict-test-data', JSON.stringify({
        localVersion: 1,
        serverVersion: 2,
        conflictField: 'local-value'
      }));
    });
    
    // Go offline and make conflicting changes
    await context.setOffline(true);
    await page.fill('[data-testid="plot-name-input"]', 'Offline Edit');
    await page.click('[data-testid="save-plot"]');
    
    // Go back online
    await context.setOffline(false);
    
    // Wait for sync attempt
    await page.waitForTimeout(2000);
    
    // Verify conflict resolution dialog appears
    await expect(page.locator('[data-testid="conflict-resolution"]')).toBeVisible();
    
    // Choose to keep local changes
    await page.click('[data-testid="keep-local-changes"]');
    
    // Verify resolution
    await expect(page.locator('[data-testid="conflict-resolved"]')).toBeVisible();
  });

  test('should maintain offline functionality across page refreshes', async ({ page, context }) => {
    await page.goto('/dashboard');
    
    // Cache some data
    await page.waitForTimeout(1000);
    
    // Go offline
    await context.setOffline(true);
    
    // Refresh page
    await page.reload();
    
    // Verify offline mode persists
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    
    // Navigate to different page
    await page.click('[data-testid="plots-link"]');
    
    // Verify offline functionality on different page
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="plot-list"]')).toBeVisible();
  });

  test('should show appropriate offline messages', async ({ page, context }) => {
    await page.goto('/dashboard');
    
    // Go offline
    await context.setOffline(true);
    
    // Try to perform action that requires network
    await page.click('[data-testid="sync-now-button"]');
    
    // Verify offline message
    await expect(page.locator('[data-testid="offline-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="offline-message"]')).toContainText('offline');
    
    // Try to access feature that requires network
    await page.click('[data-testid="market-prices-link"]');
    
    // Verify cached data message
    await expect(page.locator('[data-testid="cached-data-notice"]')).toBeVisible();
  });
});