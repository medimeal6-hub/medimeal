// Health Survey tests for MediMeal
import { test, expect } from '@playwright/test';
import { TestHelpers, healthConditions } from './utils/test-helpers.js';

test.describe('Health Survey', () => {
  let helpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.loginAsUser();
  });

  test.describe('Survey Display', () => {
    test('should display health survey on dashboard load', async ({ page }) => {
      await expect(page.locator('[data-testid="health-survey"]')).toBeVisible();
    });

    test('should show survey header and description', async ({ page }) => {
      const survey = page.locator('[data-testid="health-survey"]');
      
      await expect(survey.locator('text=Health Preferences')).toBeVisible();
      await expect(survey.locator('text=Update your health conditions')).toBeVisible();
    });

    test('should display close button', async ({ page }) => {
      await expect(page.locator('[data-testid="close-survey-button"]')).toBeVisible();
    });
  });

  test.describe('Health Conditions Selection', () => {
    test('should display all health condition options', async ({ page }) => {
      const expectedConditions = [
        'High Blood Pressure',
        'Diabetes / High Sugar',
        'Pregnancy',
        'High Cholesterol',
        'Heart Disease',
        'Kidney Disease',
        'Acid Reflux / GERD',
        'Gluten Intolerance',
        'Lactose Intolerance'
      ];

      for (const condition of expectedConditions) {
        await expect(page.locator(`text=${condition}`)).toBeVisible();
      }
    });

    test('should select and deselect health conditions', async ({ page }) => {
      // Select diabetes condition
      await page.click('[data-testid="condition-hasSugar"]');
      
      // Check if condition is selected
      await expect(page.locator('[data-testid="condition-hasSugar"]')).toHaveClass(/selected/);
      
      // Deselect condition
      await page.click('[data-testid="condition-hasSugar"]');
      
      // Check if condition is deselected
      await expect(page.locator('[data-testid="condition-hasSugar"]')).not.toHaveClass(/selected/);
    });

    test('should show condition descriptions', async ({ page }) => {
      const conditionDescriptions = [
        'Meals low in sodium and healthy fats',
        'Meals with controlled carbohydrates and low glycemic index',
        'Pregnancy-safe meals with essential nutrients',
        'Heart-healthy meals low in saturated fats',
        'Cardiac-friendly meals rich in omega-3s',
        'Low-protein, kidney-friendly meals',
        'Meals avoiding trigger foods',
        'Gluten-free meal options',
        'Dairy-free meal options'
      ];

      for (const description of conditionDescriptions) {
        await expect(page.locator(`text=${description}`)).toBeVisible();
      }
    });

    test('should handle multiple condition selections', async ({ page }) => {
      const conditionsToSelect = ['hasSugar', 'hasPressure', 'isPregnant'];
      
      for (const condition of conditionsToSelect) {
        await page.click(`[data-testid="condition-${condition}"]`);
      }
      
      // Verify all conditions are selected
      for (const condition of conditionsToSelect) {
        await expect(page.locator(`[data-testid="condition-${condition}"]`)).toHaveClass(/selected/);
      }
    });
  });

  test.describe('Allergies and Other Conditions', () => {
    test('should display allergies input field', async ({ page }) => {
      await expect(page.locator('[data-testid="allergies-input"]')).toBeVisible();
      await expect(page.locator('text=Food Allergies')).toBeVisible();
    });

    test('should display other conditions input field', async ({ page }) => {
      await expect(page.locator('[data-testid="other-conditions-input"]')).toBeVisible();
      await expect(page.locator('text=Other Conditions')).toBeVisible();
    });

    test('should fill allergies field', async ({ page }) => {
      const allergies = 'peanuts, shellfish, eggs';
      
      await page.fill('[data-testid="allergies-input"]', allergies);
      
      const inputValue = await page.inputValue('[data-testid="allergies-input"]');
      expect(inputValue).toBe(allergies);
    });

    test('should fill other conditions field', async ({ page }) => {
      const otherConditions = 'anemia, thyroid issues';
      
      await page.fill('[data-testid="other-conditions-input"]', otherConditions);
      
      const inputValue = await page.inputValue('[data-testid="other-conditions-input"]');
      expect(inputValue).toBe(otherConditions);
    });

    test('should show help text for input fields', async ({ page }) => {
      await expect(page.locator('text=Separate multiple allergies with commas')).toBeVisible();
      await expect(page.locator('text=Separate multiple conditions with commas')).toBeVisible();
    });
  });

  test.describe('Survey Submission', () => {
    test('should save preferences successfully', async ({ page }) => {
      // Select some conditions
      await page.click('[data-testid="condition-hasSugar"]');
      await page.click('[data-testid="condition-hasPressure"]');
      
      // Fill allergies
      await page.fill('[data-testid="allergies-input"]', 'peanuts, shellfish');
      
      // Submit survey
      await page.click('[data-testid="save-preferences-button"]');
      
      // Survey should be hidden after successful submission
      await expect(page.locator('[data-testid="health-survey"]')).toBeHidden();
      
      // Should show success message or update UI
      await expect(page.locator('text=✓ Filtered by your health conditions')).toBeVisible();
    });

    test('should show loading state during submission', async ({ page }) => {
      await page.click('[data-testid="condition-hasSugar"]');
      await page.click('[data-testid="save-preferences-button"]');
      
      // Should show loading state
      await expect(page.locator('text=Saving...')).toBeVisible();
    });

    test('should handle submission errors gracefully', async ({ page }) => {
      // Mock network error
      await page.route('**/api/users/*', route => route.abort());
      
      await page.click('[data-testid="condition-hasSugar"]');
      await page.click('[data-testid="save-preferences-button"]');
      
      // Should show error message
      await expect(page.locator('text=Failed to save survey')).toBeVisible();
    });
  });

  test.describe('Survey Dismissal', () => {
    test('should close survey with close button', async ({ page }) => {
      await page.click('[data-testid="close-survey-button"]');
      
      await expect(page.locator('[data-testid="health-survey"]')).toBeHidden();
    });

    test('should close survey with cancel button', async ({ page }) => {
      await page.click('[data-testid="cancel-button"]');
      
      await expect(page.locator('[data-testid="health-survey"]')).toBeHidden();
    });

    test('should close survey with skip button', async ({ page }) => {
      await page.click('[data-testid="skip-button"]');
      
      await expect(page.locator('[data-testid="health-survey"]')).toBeHidden();
    });
  });

  test.describe('Meal Filtering Based on Survey', () => {
    test('should filter meals for diabetes', async ({ page }) => {
      // Select diabetes condition
      await page.click('[data-testid="condition-hasSugar"]');
      await page.click('[data-testid="save-preferences-button"]');
      
      // Wait for survey to close
      await expect(page.locator('[data-testid="health-survey"]')).toBeHidden();
      
      // Check if meals are filtered (diabetes-unsuitable meals should be hidden)
      const mealsGrid = page.locator('[data-testid="meals-grid"]');
      const meals = mealsGrid.locator('[data-testid^="meal-card-"]');
      
      const count = await meals.count();
      for (let i = 0; i < count; i++) {
        const mealCard = meals.nth(i);
        // Meals unsuitable for diabetes should not be visible
        await expect(mealCard).not.toContainText('Grilled Turkey Breast'); // This meal is unsuitable for diabetes
      }
    });

    test('should filter meals for dairy-free diet', async ({ page }) => {
      // Select lactose intolerance
      await page.click('[data-testid="condition-hasLactoseIntolerance"]');
      await page.click('[data-testid="save-preferences-button"]');
      
      await expect(page.locator('[data-testid="health-survey"]')).toBeHidden();
      
      // Check if dairy-containing meals are filtered out
      const mealsGrid = page.locator('[data-testid="meals-grid"]');
      const meals = mealsGrid.locator('[data-testid^="meal-card-"]');
      
      const count = await meals.count();
      for (let i = 0; i < count; i++) {
        const mealCard = meals.nth(i);
        // Dairy-containing meals should not be visible
        await expect(mealCard).not.toContainText('Greek Yogurt'); // This meal contains dairy
      }
    });

    test('should filter meals for gluten-free diet', async ({ page }) => {
      // Select gluten intolerance
      await page.click('[data-testid="condition-hasGlutenIntolerance"]');
      await page.click('[data-testid="save-preferences-button"]');
      
      await expect(page.locator('[data-testid="health-survey"]')).toBeHidden();
      
      // Check if gluten-containing meals are filtered out
      const mealsGrid = page.locator('[data-testid="meals-grid"]');
      const meals = mealsGrid.locator('[data-testid^="meal-card-"]');
      
      const count = await meals.count();
      for (let i = 0; i < count; i++) {
        const mealCard = meals.nth(i);
        // Gluten-containing meals should not be visible
        await expect(mealCard).not.toContainText('Avocado Toast'); // This meal contains gluten
        await expect(mealCard).not.toContainText('Mediterranean Chicken Wrap'); // This meal contains gluten
      }
    });

    test('should show filtering indicator', async ({ page }) => {
      await page.click('[data-testid="condition-hasSugar"]');
      await page.click('[data-testid="save-preferences-button"]');
      
      await expect(page.locator('[data-testid="health-survey"]')).toBeHidden();
      
      // Should show filtering indicator
      await expect(page.locator('text=✓ Filtered by your health conditions')).toBeVisible();
    });
  });

  test.describe('Survey Persistence', () => {
    test('should pre-populate survey with existing data', async ({ page }) => {
      // First, fill out survey
      await page.click('[data-testid="condition-hasSugar"]');
      await page.fill('[data-testid="allergies-input"]', 'peanuts, shellfish');
      await page.click('[data-testid="save-preferences-button"]');
      
      await expect(page.locator('[data-testid="health-survey"]')).toBeHidden();
      
      // Refresh page to trigger survey again
      await page.reload();
      
      // Survey should appear again and be pre-populated
      await expect(page.locator('[data-testid="health-survey"]')).toBeVisible();
      
      // Check if diabetes condition is pre-selected
      await expect(page.locator('[data-testid="condition-hasSugar"]')).toHaveClass(/selected/);
      
      // Check if allergies are pre-filled
      const allergiesValue = await page.inputValue('[data-testid="allergies-input"]');
      expect(allergiesValue).toBe('peanuts, shellfish');
    });
  });

  test.describe('Survey Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await expect(page.locator('[data-testid="health-survey"]')).toBeVisible();
      
      // Check if condition cards are properly displayed
      await expect(page.locator('[data-testid="condition-hasSugar"]')).toBeVisible();
      
      // Check if input fields are accessible
      await expect(page.locator('[data-testid="allergies-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="other-conditions-input"]')).toBeVisible();
    });

    test('should work on tablet devices', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await expect(page.locator('[data-testid="health-survey"]')).toBeVisible();
      
      // Check if condition grid is properly displayed
      const conditionsGrid = page.locator('[data-testid="conditions-grid"]');
      await expect(conditionsGrid).toBeVisible();
    });
  });
});
