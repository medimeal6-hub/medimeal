// Authentication tests for MediMeal
import { test, expect } from '@playwright/test';
import { TestHelpers, testUsers } from './utils/test-helpers.js';

test.describe('Authentication', () => {
  let helpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test.describe('Login Page', () => {
    test('should display login form elements', async ({ page }) => {
      await page.goto('/login');
      
      // Check if login form elements are visible
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toContainText('Sign In');
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.goto('/login');
      
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Check for validation messages
      await expect(page.locator('text=Please fill in all fields')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      
      await page.fill('#email', 'invalid@test.com');
      await page.fill('#password', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      // Check for error message
      await expect(page.locator('text=Invalid credentials')).toBeVisible();
    });
  });

  test.describe('User Login', () => {
    test('should login successfully as user', async ({ page }) => {
      await helpers.loginAsUser();
      
      // Should redirect to dashboard
      await expect(page).toHaveURL('/dashboard');
      
      // Should show user dashboard elements
      await expect(page.locator('text=Dashboard')).toBeVisible();
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    test('should login successfully as admin', async ({ page }) => {
      await helpers.loginAsAdmin();
      
      // Should redirect to admin dashboard
      await expect(page).toHaveURL('/admin');
      
      // Should show admin dashboard elements
      await expect(page.locator('text=Admin Dashboard')).toBeVisible();
      await expect(page.locator('[data-testid="admin-menu"]')).toBeVisible();
    });

    test('should login successfully as doctor', async ({ page }) => {
      await helpers.loginAsDoctor();
      
      // Should redirect to doctor dashboard
      await expect(page).toHaveURL('/doctor');
      
      // Should show doctor dashboard elements
      await expect(page.locator('text=Doctor Dashboard')).toBeVisible();
      await expect(page.locator('[data-testid="doctor-menu"]')).toBeVisible();
    });
  });

  test.describe('Registration', () => {
    test('should display registration form', async ({ page }) => {
      await page.goto('/register');
      
      // Check if registration form elements are visible
      await expect(page.locator('[data-testid="first-name-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="last-name-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="confirm-password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="register-button"]')).toBeVisible();
    });

    test('should show validation errors for invalid registration', async ({ page }) => {
      await page.goto('/register');
      
      // Try to register with invalid data
      await page.fill('[data-testid="first-name-input"]', '');
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.fill('[data-testid="password-input"]', '123');
      await page.click('[data-testid="register-button"]');
      
      // Check for validation messages
      await expect(page.locator('text=First name is required')).toBeVisible();
      await expect(page.locator('text=Please enter a valid email')).toBeVisible();
      await expect(page.locator('text=Password must be at least 6 characters')).toBeVisible();
    });

    test('should register new user successfully', async ({ page }) => {
      await page.goto('/register');
      
      const timestamp = Date.now();
      const testEmail = `testuser${timestamp}@test.com`;
      
      await page.fill('[data-testid="first-name-input"]', 'Test');
      await page.fill('[data-testid="last-name-input"]', 'User');
      await page.fill('[data-testid="email-input"]', testEmail);
      await page.fill('[data-testid="password-input"]', 'Test123!');
      await page.fill('[data-testid="confirm-password-input"]', 'Test123!');
      await page.click('[data-testid="register-button"]');
      
      // Should redirect to dashboard after successful registration
      await expect(page).toHaveURL('/dashboard');
    });
  });

  test.describe('Password Reset', () => {
    test('should display forgot password form', async ({ page }) => {
      await page.goto('/forgot-password');
      
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="reset-button"]')).toBeVisible();
      await expect(page.locator('text=Forgot Password')).toBeVisible();
    });

    test('should show success message for valid email', async ({ page }) => {
      await page.goto('/forgot-password');
      
      await page.fill('[data-testid="email-input"]', 'test@test.com');
      await page.click('[data-testid="reset-button"]');
      
      await expect(page.locator('text=Password reset email sent')).toBeVisible();
    });
  });

  test.describe('Logout', () => {
    test('should logout successfully', async ({ page }) => {
      await helpers.loginAsUser();
      
      // Click logout button
      await page.click('[data-testid="logout-button"]');
      
      // Should redirect to login page
      await expect(page).toHaveURL('/login');
      
      // Should not be able to access protected routes
      await page.goto('/dashboard');
      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login for unauthenticated users', async ({ page }) => {
      // Try to access protected route without login
      await page.goto('/dashboard');
      await expect(page).toHaveURL('/login');
      
      await page.goto('/admin');
      await expect(page).toHaveURL('/login');
      
      await page.goto('/doctor');
      await expect(page).toHaveURL('/login');
    });

    test('should prevent user from accessing admin routes', async ({ page }) => {
      await helpers.loginAsUser();
      
      // Try to access admin route as user
      await page.goto('/admin');
      
      // Should redirect to dashboard or show access denied
      await expect(page).not.toHaveURL('/admin');
    });

    test('should prevent admin from accessing doctor routes', async ({ page }) => {
      await helpers.loginAsAdmin();
      
      // Try to access doctor route as admin
      await page.goto('/doctor');
      
      // Should redirect to admin dashboard or show access denied
      await expect(page).not.toHaveURL('/doctor');
    });
  });

  test.describe('OAuth Login', () => {
    test('should display Google login button', async ({ page }) => {
      await page.goto('/login');
      
      await expect(page.locator('[data-testid="google-login-button"]')).toBeVisible();
    });

    test('should display Firebase login button', async ({ page }) => {
      await page.goto('/login');
      
      await expect(page.locator('[data-testid="firebase-login-button"]')).toBeVisible();
    });
  });
});
