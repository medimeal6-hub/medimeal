// Doctor Dashboard tests for MediMeal
import { test, expect } from '@playwright/test';
import { TestHelpers, testUsers } from './utils/test-helpers.js';

test.describe('Doctor Dashboard', () => {
  let helpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.loginAsDoctor();
  });

  test.describe('Doctor Dashboard Layout', () => {
    test('should display doctor dashboard elements', async ({ page }) => {
      await expect(page.locator('text=Doctor Dashboard')).toBeVisible();
      await expect(page.locator('[data-testid="doctor-sidebar"]')).toBeVisible();
      await expect(page.locator('[data-testid="doctor-top-navbar"]')).toBeVisible();
    });

    test('should display doctor navigation menu', async ({ page }) => {
      const doctorNavItems = [
        'Dashboard', 'Schedules', 'Patients', 'Appointments',
        'Billing', 'Help Center', 'Settings'
      ];

      for (const item of doctorNavItems) {
        await expect(page.locator(`text=${item}`)).toBeVisible();
      }
    });

    test('should display hospital statistics', async ({ page }) => {
      const statsCards = [
        '[data-testid="beds-available-card"]',
        '[data-testid="doctors-available-card"]',
        '[data-testid="ambulances-available-card"]'
      ];

      for (const card of statsCards) {
        await expect(page.locator(card)).toBeVisible();
      }
    });

    test('should show correct hospital statistics values', async ({ page }) => {
      await expect(page.locator('text=86')).toBeVisible(); // Beds available
      await expect(page.locator('text=126')).toBeVisible(); // Doctors available
      await expect(page.locator('text=32')).toBeVisible(); // Ambulances available
    });
  });

  test.describe('Patient Management', () => {
    test('should display assigned patients', async ({ page }) => {
      await expect(page.locator('[data-testid="assigned-patients-table"]')).toBeVisible();
      await expect(page.locator('text=Patient Name')).toBeVisible();
      await expect(page.locator('text=Age')).toBeVisible();
      await expect(page.locator('text=Ward')).toBeVisible();
      await expect(page.locator('text=Priority')).toBeVisible();
    });

    test('should show patient details with correct information', async ({ page }) => {
      const patientRows = page.locator('[data-testid^="patient-row-"]');
      const count = await patientRows.count();
      
      if (count > 0) {
        const firstPatient = patientRows.first();
        
        // Check if patient details are displayed
        await expect(firstPatient.locator('[data-testid="patient-name"]')).toBeVisible();
        await expect(firstPatient.locator('[data-testid="patient-age"]')).toBeVisible();
        await expect(firstPatient.locator('[data-testid="ward-number"]')).toBeVisible();
        await expect(firstPatient.locator('[data-testid="priority-level"]')).toBeVisible();
      }
    });

    test('should display priority levels with correct colors', async ({ page }) => {
      const patientRows = page.locator('[data-testid^="patient-row-"]');
      const count = await patientRows.count();
      
      for (let i = 0; i < count; i++) {
        const priorityElement = patientRows.nth(i).locator('[data-testid="priority-level"]');
        const priorityText = await priorityElement.textContent();
        
        if (priorityText.toLowerCase().includes('high')) {
          await expect(priorityElement).toHaveClass(/text-red/);
        } else if (priorityText.toLowerCase().includes('medium')) {
          await expect(priorityElement).toHaveClass(/text-blue/);
        } else if (priorityText.toLowerCase().includes('low')) {
          await expect(priorityElement).toHaveClass(/text-green/);
        }
      }
    });

    test('should view patient details', async ({ page }) => {
      const firstPatient = page.locator('[data-testid^="patient-row-"]').first();
      if (await firstPatient.isVisible()) {
        await firstPatient.click();
        
        // Should show patient details modal
        await expect(page.locator('[data-testid="patient-details-modal"]')).toBeVisible();
        await expect(page.locator('[data-testid="patient-medical-history"]')).toBeVisible();
        await expect(page.locator('[data-testid="patient-medications"]')).toBeVisible();
        await expect(page.locator('[data-testid="patient-vitals"]')).toBeVisible();
      }
    });

    test('should update patient information', async ({ page }) => {
      const firstPatient = page.locator('[data-testid^="patient-row-"]').first();
      if (await firstPatient.isVisible()) {
        await firstPatient.click();
        
        await expect(page.locator('[data-testid="patient-details-modal"]')).toBeVisible();
        
        // Update patient notes
        await page.fill('[data-testid="patient-notes"]', 'Patient responding well to treatment');
        await page.click('[data-testid="save-patient-update"]');
        
        // Should show success message
        await expect(page.locator('text=Patient information updated')).toBeVisible();
      }
    });

    test('should filter patients by priority', async ({ page }) => {
      // Filter by high priority patients
      await page.selectOption('[data-testid="priority-filter"]', 'high');
      
      // Check if only high priority patients are shown
      const patientRows = page.locator('[data-testid^="patient-row-"]');
      const count = await patientRows.count();
      
      for (let i = 0; i < count; i++) {
        const priorityElement = patientRows.nth(i).locator('[data-testid="priority-level"]');
        await expect(priorityElement).toContainText('high');
      }
    });
  });

  test.describe('Schedule Management', () => {
    test('should display schedule grid', async ({ page }) => {
      await expect(page.locator('[data-testid="schedule-grid"]')).toBeVisible();
      await expect(page.locator('text=09:00')).toBeVisible();
      await expect(page.locator('text=10:00')).toBeVisible();
      await expect(page.locator('text=11:00')).toBeVisible();
      await expect(page.locator('text=12:00')).toBeVisible();
      await expect(page.locator('text=13:00')).toBeVisible();
      await expect(page.locator('text=14:00')).toBeVisible();
      await expect(page.locator('text=15:00')).toBeVisible();
      await expect(page.locator('text=16:00')).toBeVisible();
    });

    test('should display schedule activities', async ({ page }) => {
      const activities = [
        '[data-testid="activity-checkup"]',
        '[data-testid="activity-lunch"]',
        '[data-testid="activity-surgery"]',
        '[data-testid="activity-evaluation"]'
      ];

      for (const activity of activities) {
        await expect(page.locator(activity)).toBeVisible();
      }
    });

    test('should update schedule activity', async ({ page }) => {
      // Click on a time slot to update
      const timeSlot = page.locator('[data-testid="schedule-10:00"]');
      await timeSlot.click();
      
      // Should show activity selection
      await expect(page.locator('[data-testid="activity-selector"]')).toBeVisible();
      
      // Select new activity
      await page.selectOption('[data-testid="activity-select"]', 'surgery');
      await page.fill('[data-testid="activity-notes"]', 'Emergency surgery scheduled');
      await page.click('[data-testid="save-activity"]');
      
      // Should show success message
      await expect(page.locator('text=Schedule updated successfully')).toBeVisible();
    });

    test('should display activity colors correctly', async ({ page }) => {
      // Check if activities have correct color coding
      const checkupActivity = page.locator('[data-testid="activity-checkup"]');
      await expect(checkupActivity).toHaveClass(/bg-green/);
      
      const surgeryActivity = page.locator('[data-testid="activity-surgery"]');
      await expect(surgeryActivity).toHaveClass(/bg-blue/);
      
      const lunchActivity = page.locator('[data-testid="activity-lunch"]');
      await expect(lunchActivity).toHaveClass(/bg-red/);
    });
  });

  test.describe('Calendar Integration', () => {
    test('should display calendar', async ({ page }) => {
      await expect(page.locator('[data-testid="calendar-section"]')).toBeVisible();
      await expect(page.locator('text=June 2023')).toBeVisible();
    });

    test('should display calendar events', async ({ page }) => {
      const calendarEvents = page.locator('[data-testid^="calendar-event-"]');
      const count = await calendarEvents.count();
      
      if (count > 0) {
        // Check if events are displayed with correct colors
        const firstEvent = calendarEvents.first();
        await expect(firstEvent).toBeVisible();
      }
    });

    test('should display event legend', async ({ page }) => {
      await expect(page.locator('[data-testid="event-legend"]')).toBeVisible();
      await expect(page.locator('text=Surgery')).toBeVisible();
      await expect(page.locator('text=Poynton')).toBeVisible();
      await expect(page.locator('text=Evaluation')).toBeVisible();
    });

    test('should navigate calendar months', async ({ page }) => {
      // Click next month
      await page.click('[data-testid="calendar-next-month"]');
      
      // Should update calendar header
      await expect(page.locator('text=July 2023')).toBeVisible();
      
      // Click previous month
      await page.click('[data-testid="calendar-prev-month"]');
      
      // Should go back to June
      await expect(page.locator('text=June 2023')).toBeVisible();
    });

    test('should add new calendar event', async ({ page }) => {
      // Click on a calendar date
      await page.click('[data-testid="calendar-date-15"]');
      
      // Should show event creation form
      await expect(page.locator('[data-testid="event-form"]')).toBeVisible();
      
      // Fill event details
      await page.fill('[data-testid="event-title"]', 'Patient Consultation');
      await page.fill('[data-testid="event-description"]', 'Follow-up appointment');
      await page.selectOption('[data-testid="event-type"]', 'checkup');
      await page.click('[data-testid="save-event"]');
      
      // Should show success message
      await expect(page.locator('text=Event created successfully')).toBeVisible();
    });
  });

  test.describe('Appointment Management', () => {
    test('should display appointments section', async ({ page }) => {
      await page.click('[data-testid="appointments-nav"]');
      
      await expect(page.locator('[data-testid="appointments-table"]')).toBeVisible();
      await expect(page.locator('text=Patient')).toBeVisible();
      await expect(page.locator('text=Time')).toBeVisible();
      await expect(page.locator('text=Type')).toBeVisible();
      await expect(page.locator('text=Status')).toBeVisible();
    });

    test('should schedule new appointment', async ({ page }) => {
      await page.click('[data-testid="appointments-nav"]');
      await page.click('[data-testid="schedule-appointment-button"]');
      
      // Fill appointment form
      await page.selectOption('[data-testid="patient-select"]', 'patient@test.com');
      await page.fill('[data-testid="appointment-date"]', '2024-12-25');
      await page.fill('[data-testid="appointment-time"]', '14:00');
      await page.selectOption('[data-testid="appointment-type"]', 'consultation');
      await page.fill('[data-testid="appointment-notes"]', 'Regular checkup');
      
      await page.click('[data-testid="schedule-button"]');
      
      // Should show success message
      await expect(page.locator('text=Appointment scheduled successfully')).toBeVisible();
    });

    test('should update appointment status', async ({ page }) => {
      await page.click('[data-testid="appointments-nav"]');
      
      // Find an appointment and update its status
      const firstAppointment = page.locator('[data-testid^="appointment-row-"]').first();
      if (await firstAppointment.isVisible()) {
        await firstAppointment.locator('[data-testid="status-select"]').selectOption('completed');
        
        // Should show success message
        await expect(page.locator('text=Appointment status updated')).toBeVisible();
      }
    });

    test('should cancel appointment', async ({ page }) => {
      await page.click('[data-testid="appointments-nav"]');
      
      // Find an appointment and cancel it
      const firstAppointment = page.locator('[data-testid^="appointment-row-"]').first();
      if (await firstAppointment.isVisible()) {
        await firstAppointment.locator('[data-testid="cancel-appointment-button"]').click();
        
        // Confirm cancellation
        await expect(page.locator('[data-testid="confirm-cancel"]')).toBeVisible();
        await page.click('[data-testid="confirm-cancel-button"]');
        
        // Should show success message
        await expect(page.locator('text=Appointment cancelled successfully')).toBeVisible();
      }
    });
  });

  test.describe('Billing Management', () => {
    test('should display billing section', async ({ page }) => {
      await page.click('[data-testid="billing-nav"]');
      
      await expect(page.locator('[data-testid="billing-dashboard"]')).toBeVisible();
      await expect(page.locator('text=Billing Overview')).toBeVisible();
    });

    test('should display billing statistics', async ({ page }) => {
      await page.click('[data-testid="billing-nav"]');
      
      const billingStats = [
        '[data-testid="total-revenue-card"]',
        '[data-testid="pending-payments-card"]',
        '[data-testid="completed-payments-card"]'
      ];

      for (const stat of billingStats) {
        await expect(page.locator(stat)).toBeVisible();
      }
    });

    test('should view patient billing history', async ({ page }) => {
      await page.click('[data-testid="billing-nav"]');
      
      // Click on a patient to view billing history
      const firstPatient = page.locator('[data-testid^="billing-patient-"]').first();
      if (await firstPatient.isVisible()) {
        await firstPatient.click();
        
        // Should show billing history
        await expect(page.locator('[data-testid="billing-history-modal"]')).toBeVisible();
        await expect(page.locator('[data-testid="payment-history-table"]')).toBeVisible();
      }
    });
  });

  test.describe('Doctor Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check if mobile navigation is visible
      await expect(page.locator('[data-testid="mobile-doctor-menu"]')).toBeVisible();
      
      // Check if main content is accessible
      await expect(page.locator('text=Doctor Dashboard')).toBeVisible();
    });

    test('should work on tablet devices', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Check if sidebar is collapsible
      await page.click('[data-testid="doctor-sidebar-toggle"]');
      await expect(page.locator('[data-testid="doctor-sidebar"]')).toHaveClass(/collapsed/);
    });
  });

  test.describe('Data Visualization', () => {
    test('should display Echarts section', async ({ page }) => {
      await expect(page.locator('[data-testid="echarts-section"]')).toBeVisible();
      await expect(page.locator('text=Echarts')).toBeVisible();
    });

    test('should display Morris Charts section', async ({ page }) => {
      await expect(page.locator('[data-testid="morris-charts-section"]')).toBeVisible();
      await expect(page.locator('text=Morris Charts')).toBeVisible();
    });

    test('should display working track widget', async ({ page }) => {
      await expect(page.locator('[data-testid="working-track-widget"]')).toBeVisible();
      await expect(page.locator('text=Working Track')).toBeVisible();
    });
  });
});
