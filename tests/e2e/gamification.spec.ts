import { test, expect } from '@playwright/test';

test.describe('Gamification System', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { id: 'test-user-id', email: 'test@example.com' }
      }));
    });
    
    await page.goto('/dashboard');
  });

  test('should display XP progress and level', async ({ page }) => {
    // Check XP bar is visible
    await expect(page.locator('[data-testid="xp-bar"]')).toBeVisible();
    
    // Check current level
    await expect(page.locator('[data-testid="current-level"]')).toBeVisible();
    
    // Check XP points
    await expect(page.locator('[data-testid="xp-points"]')).toBeVisible();
  });

  test('should award XP for farming actions', async ({ page }) => {
    const initialXP = await page.locator('[data-testid="xp-points"]').textContent();
    
    // Perform a farming action (water crops)
    await page.click('[data-testid="water-crops-button"]');
    
    // Wait for XP notification
    await expect(page.locator('[data-testid="xp-notification"]')).toBeVisible();
    
    // Verify XP increased
    const newXP = await page.locator('[data-testid="xp-points"]').textContent();
    expect(newXP).not.toBe(initialXP);
  });

  test('should display badges and achievements', async ({ page }) => {
    // Navigate to gamification dashboard
    await page.click('[data-testid="gamification-link"]');
    
    // Check badges section
    await expect(page.locator('[data-testid="badges-section"]')).toBeVisible();
    
    // Check earned badges
    await expect(page.locator('[data-testid="earned-badges"]')).toBeVisible();
    
    // Check available badges
    await expect(page.locator('[data-testid="available-badges"]')).toBeVisible();
  });

  test('should show quest system', async ({ page }) => {
    await page.goto('/gamification');
    
    // Check active quests
    await expect(page.locator('[data-testid="active-quests"]')).toBeVisible();
    
    // Click on a quest
    await page.click('[data-testid="quest-item"]:first-child');
    
    // Verify quest details
    await expect(page.locator('[data-testid="quest-details"]')).toBeVisible();
    
    // Check quest progress
    await expect(page.locator('[data-testid="quest-progress"]')).toBeVisible();
  });
});