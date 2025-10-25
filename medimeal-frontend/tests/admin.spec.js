// Admin Dashboard tests for MediMeal
import { test, expect } from '@playwright/test';
import { TestHelpers, testUsers } from './utils/test-helpers.js';

test.describe('Admin Dashboard', () => {
  let helpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.loginAsAdmin();
  });

  test.describe('Admin Dashboard Layout', () => {
    test('should display admin dashboard elements', async ({ page }) => {
      await expect(page.locator('text=Admin Dashboard')).toBeVisible();
      await expect(page.locator('[data-testid="admin-sidebar"]')).toBeVisible();
      await expect(page.locator('[data-testid="admin-top-navbar"]')).toBeVisible();
    });

    test('should display admin navigation menu', async ({ page }) => {
      const adminNavItems = [
        'Dashboard', 'Users', 'Doctors', 'Patients',
        'Prescriptions', 'Conflicts', 'Alerts', 'Analytics'
      ];

      for (const item of adminNavItems) {
        await expect(page.locator(`text=${item}`)).toBeVisible();
      }
    });

    test('should display admin statistics', async ({ page }) => {
      const statsCards = [
        '[data-testid="total-users-card"]',
        '[data-testid="total-doctors-card"]',
        '[data-testid="total-patients-card"]',
        '[data-testid="active-prescriptions-card"]'
      ];

      for (const card of statsCards) {
        await expect(page.locator(card)).toBeVisible();
      }
    });
  });

  test.describe('User Management', () => {
    test('should display users table', async ({ page }) => {
      await page.click('[data-testid="users-nav"]');
      
      await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
      await expect(page.locator('text=Email')).toBeVisible();
      await expect(page.locator('text=Role')).toBeVisible();
      await expect(page.locator('text=Status')).toBeVisible();
    });

    test('should filter users by role', async ({ page }) => {
      await page.click('[data-testid="users-nav"]');
      
      // Filter by doctor role
      await page.selectOption('[data-testid="role-filter"]', 'doctor');
      
      // Check if only doctors are shown
      const userRows = page.locator('[data-testid^="user-row-"]');
      const count = await userRows.count();
      
      for (let i = 0; i < count; i++) {
        const roleCell = userRows.nth(i).locator('[data-testid="user-role"]');
        await expect(roleCell).toContainText('doctor');
      }
    });

    test('should change user role', async ({ page }) => {
      await page.click('[data-testid="users-nav"]');
      
      // Find a user row and change their role
      const firstUserRow = page.locator('[data-testid^="user-row-"]').first();
      await firstUserRow.locator('[data-testid="role-select"]').selectOption('doctor');
      
      // Confirm role change
      await page.click('[data-testid="save-role-button"]');
      
      // Should show success message
      await expect(page.locator('text=Role updated successfully')).toBeVisible();
    });

    test('should activate/deactivate users', async ({ page }) => {
      await page.click('[data-testid="users-nav"]');
      
      // Find an inactive user and activate them
      const inactiveUser = page.locator('[data-testid="user-status-inactive"]').first();
      if (await inactiveUser.isVisible()) {
        await inactiveUser.click();
        
        // Should show confirmation dialog
        await expect(page.locator('[data-testid="confirm-activation"]')).toBeVisible();
        await page.click('[data-testid="confirm-activation-button"]');
        
        // Should show success message
        await expect(page.locator('text=User activated successfully')).toBeVisible();
      }
    });

    test('should search users', async ({ page }) => {
      await page.click('[data-testid="users-nav"]');
      
      await page.fill('[data-testid="user-search"]', 'doctor');
      await page.press('[data-testid="user-search"]', 'Enter');
      
      // Should filter users based on search
      const userRows = page.locator('[data-testid^="user-row-"]');
      const count = await userRows.count();
      
      for (let i = 0; i < count; i++) {
        const emailCell = userRows.nth(i).locator('[data-testid="user-email"]');
        const emailText = await emailCell.textContent();
        expect(emailText.toLowerCase()).toContain('doctor');
      }
    });
  });

  test.describe('Doctor Management', () => {
    test('should display doctors table', async ({ page }) => {
      await page.click('[data-testid="doctors-nav"]');
      
      await expect(page.locator('[data-testid="doctors-table"]')).toBeVisible();
      await expect(page.locator('text=Name')).toBeVisible();
      await expect(page.locator('text=Specialization')).toBeVisible();
      await expect(page.locator('text=License')).toBeVisible();
    });

    test('should add new doctor', async ({ page }) => {
      await page.click('[data-testid="doctors-nav"]');
      await page.click('[data-testid="add-doctor-button"]');
      
      // Fill doctor form
      const doctorData = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@test.com',
        specialization: 'Cardiology',
        licenseNumber: 'LIC123456',
        hospitalAffiliation: 'Test Hospital'
      };
      
      await helpers.fillForm(doctorData);
      await page.click('[data-testid="create-doctor-button"]');
      
      // Should show success message
      await expect(page.locator('text=Doctor created successfully')).toBeVisible();
      
      // Should redirect back to doctors table
      await expect(page.locator('[data-testid="doctors-table"]')).toBeVisible();
    });

    test('should edit doctor information', async ({ page }) => {
      await page.click('[data-testid="doctors-nav"]');
      
      // Click edit button on first doctor
      const firstDoctorRow = page.locator('[data-testid^="doctor-row-"]').first();
      await firstDoctorRow.locator('[data-testid="edit-doctor-button"]').click();
      
      // Update specialization
      await page.fill('[data-testid="specialization-input"]', 'Neurology');
      await page.click('[data-testid="save-doctor-button"]');
      
      // Should show success message
      await expect(page.locator('text=Doctor updated successfully')).toBeVisible();
    });

    test('should delete doctor', async ({ page }) => {
      await page.click('[data-testid="doctors-nav"]');
      
      // Click delete button on first doctor
      const firstDoctorRow = page.locator('[data-testid^="doctor-row-"]').first();
      await firstDoctorRow.locator('[data-testid="delete-doctor-button"]').click();
      
      // Confirm deletion
      await expect(page.locator('[data-testid="confirm-delete"]')).toBeVisible();
      await page.click('[data-testid="confirm-delete-button"]');
      
      // Should show success message
      await expect(page.locator('text=Doctor deleted successfully')).toBeVisible();
    });
  });

  test.describe('Patient Assignment', () => {
    test('should display patient assignment interface', async ({ page }) => {
      await page.click('[data-testid="patients-nav"]');
      
      await expect(page.locator('[data-testid="patient-assignment"]')).toBeVisible();
      await expect(page.locator('text=Assign Patient to Doctor')).toBeVisible();
    });

    test('should assign patient to doctor', async ({ page }) => {
      await page.click('[data-testid="patients-nav"]');
      
      // Fill assignment form
      await page.selectOption('[data-testid="patient-select"]', 'patient@test.com');
      await page.selectOption('[data-testid="doctor-select"]', 'doctor@test.com');
      await page.fill('[data-testid="ward-number"]', '#999999');
      await page.selectOption('[data-testid="priority-select"]', 'high');
      await page.fill('[data-testid="diagnosis-input"]', 'Hypertension');
      await page.fill('[data-testid="treatment-plan"]', 'Monitor blood pressure');
      
      await page.click('[data-testid="assign-button"]');
      
      // Should show success message
      await expect(page.locator('text=Patient assigned successfully')).toBeVisible();
    });

    test('should view assigned patients', async ({ page }) => {
      await page.click('[data-testid="patients-nav"]');
      
      // Check if assigned patients are displayed
      await expect(page.locator('[data-testid="assigned-patients-table"]')).toBeVisible();
      
      // Check if patient details are shown
      const patientRows = page.locator('[data-testid^="assigned-patient-"]');
      const count = await patientRows.count();
      
      if (count > 0) {
        const firstPatient = patientRows.first();
        await expect(firstPatient.locator('[data-testid="patient-name"]')).toBeVisible();
        await expect(firstPatient.locator('[data-testid="ward-number"]')).toBeVisible();
        await expect(firstPatient.locator('[data-testid="priority-level"]')).toBeVisible();
      }
    });

    test('should update patient assignment', async ({ page }) => {
      await page.click('[data-testid="patients-nav"]');
      
      // Find an assigned patient and update their assignment
      const firstPatient = page.locator('[data-testid^="assigned-patient-"]').first();
      if (await firstPatient.isVisible()) {
        await firstPatient.locator('[data-testid="edit-assignment-button"]').click();
        
        // Update ward number
        await page.fill('[data-testid="ward-number"]', '#888888');
        await page.click('[data-testid="update-assignment-button"]');
        
        // Should show success message
        await expect(page.locator('text=Assignment updated successfully')).toBeVisible();
      }
    });
  });

  test.describe('Prescription Monitoring', () => {
    test('should display prescriptions table', async ({ page }) => {
      await page.click('[data-testid="prescriptions-nav"]');
      
      await expect(page.locator('[data-testid="prescriptions-table"]')).toBeVisible();
      await expect(page.locator('text=Patient')).toBeVisible();
      await expect(page.locator('text=Medication')).toBeVisible();
      await expect(page.locator('text=Status')).toBeVisible();
    });

    test('should filter prescriptions by status', async ({ page }) => {
      await page.click('[data-testid="prescriptions-nav"]');
      
      // Filter by active prescriptions
      await page.selectOption('[data-testid="status-filter"]', 'active');
      
      // Check if only active prescriptions are shown
      const prescriptionRows = page.locator('[data-testid^="prescription-row-"]');
      const count = await prescriptionRows.count();
      
      for (let i = 0; i < count; i++) {
        const statusCell = prescriptionRows.nth(i).locator('[data-testid="prescription-status"]');
        await expect(statusCell).toContainText('active');
      }
    });

    test('should view prescription details', async ({ page }) => {
      await page.click('[data-testid="prescriptions-nav"]');
      
      // Click on first prescription to view details
      const firstPrescription = page.locator('[data-testid^="prescription-row-"]').first();
      if (await firstPrescription.isVisible()) {
        await firstPrescription.click();
        
        // Should show prescription details modal
        await expect(page.locator('[data-testid="prescription-details-modal"]')).toBeVisible();
        await expect(page.locator('[data-testid="medication-name"]')).toBeVisible();
        await expect(page.locator('[data-testid="dosage-info"]')).toBeVisible();
      }
    });
  });

  test.describe('Conflict Detection', () => {
    test('should display conflicts table', async ({ page }) => {
      await page.click('[data-testid="conflicts-nav"]');
      
      await expect(page.locator('[data-testid="conflicts-table"]')).toBeVisible();
      await expect(page.locator('text=Patient')).toBeVisible();
      await expect(page.locator('text=Medication')).toBeVisible();
      await expect(page.locator('text=Food Item')).toBeVisible();
      await expect(page.locator('text=Severity')).toBeVisible();
    });

    test('should filter conflicts by severity', async ({ page }) => {
      await page.click('[data-testid="conflicts-nav"]');
      
      // Filter by high severity conflicts
      await page.selectOption('[data-testid="severity-filter"]', 'high');
      
      // Check if only high severity conflicts are shown
      const conflictRows = page.locator('[data-testid^="conflict-row-"]');
      const count = await conflictRows.count();
      
      for (let i = 0; i < count; i++) {
        const severityCell = conflictRows.nth(i).locator('[data-testid="conflict-severity"]');
        await expect(severityCell).toContainText('high');
      }
    });

    test('should resolve conflicts', async ({ page }) => {
      await page.click('[data-testid="conflicts-nav"]');
      
      // Find a conflict and resolve it
      const firstConflict = page.locator('[data-testid^="conflict-row-"]').first();
      if (await firstConflict.isVisible()) {
        await firstConflict.locator('[data-testid="resolve-conflict-button"]').click();
        
        // Should show resolution form
        await expect(page.locator('[data-testid="resolution-form"]')).toBeVisible();
        
        // Fill resolution details
        await page.fill('[data-testid="resolution-notes"]', 'Conflict resolved by dietary modification');
        await page.click('[data-testid="confirm-resolution-button"]');
        
        // Should show success message
        await expect(page.locator('text=Conflict resolved successfully')).toBeVisible();
      }
    });
  });

  test.describe('Analytics Dashboard', () => {
    test('should display analytics charts', async ({ page }) => {
      await page.click('[data-testid="analytics-nav"]');
      
      await expect(page.locator('[data-testid="analytics-dashboard"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-registration-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="prescription-trends-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="conflict-analysis-chart"]')).toBeVisible();
    });

    test('should display key metrics', async ({ page }) => {
      await page.click('[data-testid="analytics-nav"]');
      
      const metricsCards = [
        '[data-testid="total-users-metric"]',
        '[data-testid="active-doctors-metric"]',
        '[data-testid="prescriptions-processed-metric"]',
        '[data-testid="conflicts-detected-metric"]'
      ];

      for (const card of metricsCards) {
        await expect(page.locator(card)).toBeVisible();
      }
    });

    test('should filter analytics by date range', async ({ page }) => {
      await page.click('[data-testid="analytics-nav"]');
      
      // Set date range
      await page.fill('[data-testid="start-date"]', '2024-01-01');
      await page.fill('[data-testid="end-date"]', '2024-12-31');
      await page.click('[data-testid="apply-date-filter"]');
      
      // Charts should update with new data
      await expect(page.locator('[data-testid="user-registration-chart"]')).toBeVisible();
    });
  });

  test.describe('Admin Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check if mobile navigation is visible
      await expect(page.locator('[data-testid="mobile-admin-menu"]')).toBeVisible();
      
      // Check if main content is accessible
      await expect(page.locator('text=Admin Dashboard')).toBeVisible();
    });

    test('should work on tablet devices', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Check if sidebar is collapsible
      await page.click('[data-testid="admin-sidebar-toggle"]');
      await expect(page.locator('[data-testid="admin-sidebar"]')).toHaveClass(/collapsed/);
    });
  });
});
