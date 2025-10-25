// Dashboard tests for MediMeal
import { test, expect } from '@playwright/test';
import { TestHelpers, testUsers, testMeals } from './utils/test-helpers.js';

test.describe('User Dashboard', () => {
  let helpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.loginAsUser();
  });

  test.describe('Dashboard Layout', () => {
    test('should display dashboard elements', async ({ page }) => {
      await expect(page.locator('text=Dashboard')).toBeVisible();
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
      await expect(page.locator('[data-testid="top-navbar"]')).toBeVisible();
    });

    test('should display navigation menu', async ({ page }) => {
      const navItems = [
        'Dashboard', 'Calendar', 'Healthy Menu', 'Meal Plan',
        'Food Diary', 'Medications', 'Progress', 'Exercises',
        'Insights', 'Alerts', 'Settings'
      ];

      for (const item of navItems) {
        await expect(page.locator(`text=${item}`)).toBeVisible();
      }
    });

    test('should display user profile in top navbar', async ({ page }) => {
      await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
      await expect(page.locator('[data-testid="notification-bell"]')).toBeVisible();
      await expect(page.locator('[data-testid="search-bar"]')).toBeVisible();
    });
  });

  test.describe('Featured Menu Section', () => {
    test('should display featured meal', async ({ page }) => {
      await expect(page.locator('text=Featured Menu')).toBeVisible();
      await expect(page.locator('[data-testid="featured-meal"]')).toBeVisible();
    });

    test('should show meal details', async ({ page }) => {
      const featuredMeal = page.locator('[data-testid="featured-meal"]');
      
      await expect(featuredMeal.locator('[data-testid="meal-name"]')).toBeVisible();
      await expect(featuredMeal.locator('[data-testid="meal-type"]')).toBeVisible();
      await expect(featuredMeal.locator('[data-testid="meal-rating"]')).toBeVisible();
      await expect(featuredMeal.locator('[data-testid="meal-health-score"]')).toBeVisible();
    });

    test('should display nutritional information', async ({ page }) => {
      const nutritionCards = [
        '[data-testid="calories-card"]',
        '[data-testid="carbs-card"]',
        '[data-testid="protein-card"]',
        '[data-testid="fats-card"]'
      ];

      for (const card of nutritionCards) {
        await expect(page.locator(card)).toBeVisible();
      }
    });

    test('should add meal to meal plan', async ({ page }) => {
      await page.click('[data-testid="add-to-meal-plan-button"]');
      
      // Should show success message or update UI
      await expect(page.locator('text=Added to meal plan')).toBeVisible();
    });
  });

  test.describe('All Menu Section', () => {
    test('should display all meals', async ({ page }) => {
      await expect(page.locator('text=All Menu')).toBeVisible();
      await expect(page.locator('[data-testid="meals-grid"]')).toBeVisible();
    });

    test('should filter meals by type', async ({ page }) => {
      const mealTypes = ['All', 'Breakfast', 'Lunch', 'Snack', 'Dinner'];
      
      for (const type of mealTypes) {
        await page.click(`[data-testid="filter-${type.toLowerCase()}"]`);
        
        // Check if only meals of selected type are shown
        const meals = page.locator('[data-testid^="meal-card-"]');
        const count = await meals.count();
        
        if (type !== 'All' && count > 0) {
          // Verify all visible meals are of the selected type
          for (let i = 0; i < count; i++) {
            const mealType = await meals.nth(i).locator('[data-testid="meal-type"]').textContent();
            expect(mealType).toBe(type);
          }
        }
      }
    });

    test('should sort meals by different criteria', async ({ page }) => {
      const sortOptions = ['calories', 'rating', 'healthScore'];
      
      for (const option of sortOptions) {
        await page.selectOption('[data-testid="sort-select"]', option);
        
        // Wait for meals to be sorted
        await page.waitForTimeout(1000);
        
        // Verify sorting (this would need more specific implementation)
        await expect(page.locator('[data-testid="meals-grid"]')).toBeVisible();
      }
    });

    test('should toggle between grid and list view', async ({ page }) => {
      // Test grid view
      await page.click('[data-testid="grid-view-button"]');
      await expect(page.locator('[data-testid="meals-grid"]')).toBeVisible();
      
      // Test list view
      await page.click('[data-testid="list-view-button"]');
      await expect(page.locator('[data-testid="meals-list"]')).toBeVisible();
    });

    test('should remove meals from dashboard', async ({ page }) => {
      const firstMeal = page.locator('[data-testid="meal-card-1"]');
      
      if (await firstMeal.isVisible()) {
        await page.click('[data-testid="remove-meal-1"]');
        
        // Confirm removal
        await page.click('[data-testid="confirm-remove-button"]');
        
        // Meal should be removed
        await expect(firstMeal).toBeHidden();
      }
    });
  });

  test.describe('Progress Stats', () => {
    test('should display progress statistics', async ({ page }) => {
      const statsCards = [
        '[data-testid="prescriptions-uploaded-card"]',
        '[data-testid="conflicts-avoided-card"]',
        '[data-testid="meals-recommended-card"]'
      ];

      for (const card of statsCards) {
        await expect(page.locator(card)).toBeVisible();
      }
    });

    test('should show progress trends', async ({ page }) => {
      const progressCards = page.locator('[data-testid^="progress-card-"]');
      const count = await progressCards.count();
      
      expect(count).toBeGreaterThan(0);
      
      // Check if trend indicators are visible
      for (let i = 0; i < count; i++) {
        await expect(progressCards.nth(i).locator('[data-testid="trend-indicator"]')).toBeVisible();
      }
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to different pages', async ({ page }) => {
      const navTests = [
        { selector: '[data-testid="calendar-nav"]', expectedUrl: '/calendar' },
        { selector: '[data-testid="meals-nav"]', expectedUrl: '/meals' },
        { selector: '[data-testid="settings-nav"]', expectedUrl: '/settings' }
      ];

      for (const navTest of navTests) {
        await page.click(navTest.selector);
        await expect(page).toHaveURL(navTest.expectedUrl);
        
        // Navigate back to dashboard
        await page.click('[data-testid="dashboard-nav"]');
        await expect(page).toHaveURL('/dashboard');
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check if mobile navigation is visible
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
      
      // Check if main content is still accessible
      await expect(page.locator('text=Dashboard')).toBeVisible();
    });

    test('should work on tablet devices', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Check if sidebar is collapsible
      await page.click('[data-testid="sidebar-toggle"]');
      await expect(page.locator('[data-testid="sidebar"]')).toHaveClass(/collapsed/);
    });
  });

  test.describe('Search Functionality', () => {
    test('should search for meals', async ({ page }) => {
      await page.fill('[data-testid="search-bar"]', 'turkey');
      await page.press('[data-testid="search-bar"]', 'Enter');
      
      // Should filter meals based on search
      await expect(page.locator('[data-testid="meals-grid"]')).toBeVisible();
    });

    test('should clear search results', async ({ page }) => {
      await page.fill('[data-testid="search-bar"]', 'turkey');
      await page.press('[data-testid="search-bar"]', 'Enter');
      
      // Clear search
      await page.click('[data-testid="clear-search-button"]');
      
      // Should show all meals again
      await expect(page.locator('[data-testid="meals-grid"]')).toBeVisible();
    });
  });
});
