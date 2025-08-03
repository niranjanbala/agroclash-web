import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests @visual', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication and data
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { id: 'test-user-id', email: 'test@example.com' }
      }));
      
      // Mock consistent data for visual tests
      window.mockData = {
        plots: [
          { id: '1', name: 'North Field', area: 2.5, crop: 'Tomatoes' },
          { id: '2', name: 'South Field', area: 1.8, crop: 'Corn' }
        ],
        xp: { current: 1250, level: 5, nextLevel: 1500 },
        weather: { temp: 24, condition: 'sunny', humidity: 65 }
      };
    });
  });

  test('should match dashboard layout', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Wait for all components to load
    await expect(page.locator('[data-testid="farm-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="xp-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="weather-widget"]')).toBeVisible();
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('dashboard-full.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('should match XP bar component', async ({ page }) => {
    await page.goto('/dashboard');
    
    const xpBar = page.locator('[data-testid="xp-bar"]');
    await expect(xpBar).toBeVisible();
    
    // Screenshot just the XP bar component
    await expect(xpBar).toHaveScreenshot('xp-bar-component.png');
  });

  test('should match weather widget states', async ({ page }) => {
    await page.goto('/dashboard');
    
    const weatherWidget = page.locator('[data-testid="weather-widget"]');
    await expect(weatherWidget).toBeVisible();
    
    // Test sunny weather state
    await expect(weatherWidget).toHaveScreenshot('weather-sunny.png');
    
    // Change to rainy weather
    await page.evaluate(() => {
      window.mockData.weather = { temp: 18, condition: 'rainy', humidity: 85 };
    });
    await page.reload();
    await expect(weatherWidget).toBeVisible();
    await expect(weatherWidget).toHaveScreenshot('weather-rainy.png');
  });

  test('should match plot overview component', async ({ page }) => {
    await page.goto('/dashboard');
    
    const plotOverview = page.locator('[data-testid="plot-overview"]');
    await expect(plotOverview).toBeVisible();
    
    await expect(plotOverview).toHaveScreenshot('plot-overview.png');
  });

  test('should match crop timeline component', async ({ page }) => {
    await page.goto('/crops');
    
    const cropTimeline = page.locator('[data-testid="crop-timeline"]');
    await expect(cropTimeline).toBeVisible();
    
    await expect(cropTimeline).toHaveScreenshot('crop-timeline.png');
  });

  test('should match marketplace component', async ({ page }) => {
    await page.goto('/marketplace');
    
    const marketplace = page.locator('[data-testid="marketplace-dashboard"]');
    await expect(marketplace).toBeVisible();
    
    await expect(marketplace).toHaveScreenshot('marketplace-dashboard.png');
  });

  test('should match clan dashboard component', async ({ page }) => {
    await page.goto('/clans');
    
    const clanDashboard = page.locator('[data-testid="clan-dashboard"]');
    await expect(clanDashboard).toBeVisible();
    
    await expect(clanDashboard).toHaveScreenshot('clan-dashboard.png');
  });

  test('should match responsive layouts', async ({ page }) => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot(`dashboard-${viewport.name}.png`, {
        fullPage: true,
        animations: 'disabled'
      });
    }
  });

  test('should match dark mode theme', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    
    await page.waitForTimeout(500); // Wait for theme transition
    
    await expect(page).toHaveScreenshot('dashboard-dark-mode.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('should match notification states', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Trigger success notification
    await page.evaluate(() => {
      const event = new CustomEvent('show-notification', {
        detail: { type: 'success', message: 'Crop watered successfully!' }
      });
      window.dispatchEvent(event);
    });
    
    await page.waitForTimeout(500);
    const notification = page.locator('[data-testid="notification"]');
    await expect(notification).toHaveScreenshot('notification-success.png');
    
    // Trigger error notification
    await page.evaluate(() => {
      const event = new CustomEvent('show-notification', {
        detail: { type: 'error', message: 'Failed to update crop status' }
      });
      window.dispatchEvent(event);
    });
    
    await page.waitForTimeout(500);
    await expect(notification).toHaveScreenshot('notification-error.png');
  });

  test('should match loading states', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Trigger loading state
    await page.evaluate(() => {
      // Show loading spinner
      const loadingElement = document.createElement('div');
      loadingElement.setAttribute('data-testid', 'loading-spinner');
      loadingElement.className = 'loading-spinner';
      loadingElement.innerHTML = '<div class="spinner"></div>';
      document.body.appendChild(loadingElement);
    });
    
    const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    await expect(loadingSpinner).toHaveScreenshot('loading-spinner.png');
  });
});