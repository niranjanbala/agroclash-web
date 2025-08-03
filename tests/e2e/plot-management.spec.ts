import { test, expect } from '@playwright/test';

test.describe('Plot Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { id: 'test-user-id', email: 'test@example.com' }
      }));
    });
    
    await page.goto('/dashboard');
  });

  test('should create a new plot', async ({ page }) => {
    // Navigate to plot manager
    await page.click('[data-testid="manage-plots-button"]');
    await expect(page).toHaveURL('/plots');
    
    // Click create plot button
    await page.click('[data-testid="create-plot-button"]');
    
    // Fill plot form
    await page.fill('[data-testid="plot-name-input"]', 'Test Plot 1');
    
    // Wait for map to load
    await page.waitForSelector('[data-testid="leaflet-map"]');
    
    // Simulate drawing a polygon (mock interaction)
    await page.click('[data-testid="draw-polygon-button"]');
    
    // Mock polygon coordinates
    await page.evaluate(() => {
      window.mockPolygonCoordinates = [
        [40.7128, -74.0060],
        [40.7138, -74.0050],
        [40.7148, -74.0070],
        [40.7128, -74.0060]
      ];
    });
    
    // Submit plot creation
    await page.click('[data-testid="save-plot-button"]');
    
    // Verify plot appears in list
    await expect(page.locator('[data-testid="plot-list"]')).toContainText('Test Plot 1');
    
    // Verify area calculation
    await expect(page.locator('[data-testid="plot-area"]')).toBeVisible();
  });

  test('should edit existing plot', async ({ page }) => {
    await page.goto('/plots');
    
    // Click edit on first plot
    await page.click('[data-testid="edit-plot-button"]:first-child');
    
    // Update plot name
    await page.fill('[data-testid="plot-name-input"]', 'Updated Plot Name');
    
    // Save changes
    await page.click('[data-testid="save-plot-button"]');
    
    // Verify update
    await expect(page.locator('[data-testid="plot-list"]')).toContainText('Updated Plot Name');
  });

  test('should assign crop to plot', async ({ page }) => {
    await page.goto('/plots');
    
    // Click on a plot
    await page.click('[data-testid="plot-item"]:first-child');
    
    // Click assign crop
    await page.click('[data-testid="assign-crop-button"]');
    
    // Select crop type
    await page.selectOption('[data-testid="crop-select"]', 'tomato');
    await page.fill('[data-testid="sown-date-input"]', '2024-01-15');
    
    // Submit crop assignment
    await page.click('[data-testid="assign-crop-submit"]');
    
    // Verify crop appears on plot
    await expect(page.locator('[data-testid="plot-crop-info"]')).toContainText('tomato');
  });
});