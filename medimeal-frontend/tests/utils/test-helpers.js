// Test utilities and helpers for MediMeal tests
import { expect } from '@playwright/test';

class TestHelpers {
  constructor(page) {
    this.page = page;
  }

  // Authentication helpers
  async loginAsUser(email = 'patient@test.com', password = 'Patient123!') {
    await this.page.goto('/login');
    await this.page.fill('#email', email);
    await this.page.fill('#password', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('/dashboard');
  }

  async loginAsAdmin(email = 'admin@test.com', password = 'Admin123!') {
    await this.page.goto('/login');
    await this.page.fill('#email', email);
    await this.page.fill('#password', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('/admin');
  }

  async loginAsDoctor(email = 'doctor@test.com', password = 'Doctor123!') {
    await this.page.goto('/login');
    await this.page.fill('#email', email);
    await this.page.fill('#password', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('/doctor');
  }

  async logout() {
    await this.page.click('[data-testid="logout-button"]');
    await this.page.waitForURL('/login');
  }

  // Navigation helpers
  async navigateToDashboard() {
    await this.page.click('[data-testid="dashboard-nav"]');
    await this.page.waitForURL('/dashboard');
  }

  async navigateToMeals() {
    await this.page.click('[data-testid="meals-nav"]');
    await this.page.waitForURL('/meals');
  }

  async navigateToCalendar() {
    await this.page.click('[data-testid="calendar-nav"]');
    await this.page.waitForURL('/calendar');
  }

  async navigateToSettings() {
    await this.page.click('[data-testid="settings-nav"]');
    await this.page.waitForURL('/settings');
  }

  // Health survey helpers
  async fillHealthSurvey(conditions = [], allergies = '', otherConditions = '') {
    // Select health conditions
    for (const condition of conditions) {
      await this.page.click(`[data-testid="condition-${condition}"]`);
    }

    // Fill allergies
    if (allergies) {
      await this.page.fill('[data-testid="allergies-input"]', allergies);
    }

    // Fill other conditions
    if (otherConditions) {
      await this.page.fill('[data-testid="other-conditions-input"]', otherConditions);
    }

    // Submit survey
    await this.page.click('[data-testid="save-preferences-button"]');
    await this.page.waitForSelector('[data-testid="health-survey"]', { state: 'hidden' });
  }

  async closeHealthSurvey() {
    await this.page.click('[data-testid="close-survey-button"]');
    await this.page.waitForSelector('[data-testid="health-survey"]', { state: 'hidden' });
  }

  // Meal management helpers
  async addMealToPlan(mealId) {
    await this.page.click(`[data-testid="add-meal-${mealId}"]`);
    await this.page.waitForSelector('[data-testid="meal-added-success"]');
  }

  async removeMeal(mealId) {
    await this.page.click(`[data-testid="remove-meal-${mealId}"]`);
    await this.page.click('[data-testid="confirm-remove-button"]');
  }

  // Admin helpers
  async createDoctor(doctorData) {
    await this.page.click('[data-testid="add-doctor-button"]');
    await this.page.fill('[data-testid="doctor-first-name"]', doctorData.firstName);
    await this.page.fill('[data-testid="doctor-last-name"]', doctorData.lastName);
    await this.page.fill('[data-testid="doctor-email"]', doctorData.email);
    await this.page.fill('[data-testid="doctor-specialization"]', doctorData.specialization);
    await this.page.click('[data-testid="create-doctor-button"]');
  }

  async assignPatientToDoctor(patientEmail, doctorEmail, wardNumber) {
    await this.page.click('[data-testid="assign-patient-button"]');
    await this.page.selectOption('[data-testid="patient-select"]', patientEmail);
    await this.page.selectOption('[data-testid="doctor-select"]', doctorEmail);
    await this.page.fill('[data-testid="ward-number"]', wardNumber);
    await this.page.click('[data-testid="assign-button"]');
  }

  // Doctor helpers
  async viewPatientDetails(patientName) {
    await this.page.click(`[data-testid="patient-${patientName}"]`);
    await this.page.waitForSelector('[data-testid="patient-details-modal"]');
  }

  async updateSchedule(timeSlot, activity) {
    await this.page.click(`[data-testid="schedule-${timeSlot}"]`);
    await this.page.selectOption('[data-testid="activity-select"]', activity);
    await this.page.click('[data-testid="save-schedule-button"]');
  }

  // Utility functions
  async waitForElement(selector, timeout = 5000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async waitForText(text, timeout = 5000) {
    await this.page.waitForSelector(`text=${text}`, { timeout });
  }

  async takeScreenshot(name) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png` });
  }

  async fillForm(formData) {
    for (const [field, value] of Object.entries(formData)) {
      await this.page.fill(`[data-testid="${field}"]`, value);
    }
  }

  async clickButton(buttonTestId) {
    await this.page.click(`[data-testid="${buttonTestId}"]`);
  }

  async expectElementVisible(selector) {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  async expectElementHidden(selector) {
    await expect(this.page.locator(selector)).toBeHidden();
  }

  async expectTextContent(selector, text) {
    await expect(this.page.locator(selector)).toContainText(text);
  }

  async expectUrl(url) {
    await expect(this.page).toHaveURL(url);
  }
}

// Test data fixtures
const testUsers = {
  admin: {
    email: 'admin@test.com',
    password: 'Admin123!',
    role: 'admin'
  },
  doctor: {
    email: 'doctor@test.com',
    password: 'Doctor123!',
    role: 'doctor',
    specialization: 'Cardiology'
  },
  patient: {
    email: 'patient@test.com',
    password: 'Patient123!',
    role: 'user'
  }
};

const testMeals = {
  grilledTurkey: {
    id: 1,
    name: 'Grilled Turkey Breast with Steamed Asparagus and Brown Rice',
    type: 'Lunch',
    calories: 450,
    unsuitableFor: ['diabetes']
  },
  breakfastBowl: {
    id: 2,
    name: 'Healthy Breakfast Bowl with Greek Yogurt and Berries',
    type: 'Breakfast',
    calories: 320,
    unsuitableFor: ['dairy-free', 'diabetes']
  }
};

const healthConditions = {
  diabetes: 'hasSugar',
  bloodPressure: 'hasPressure',
  pregnancy: 'isPregnant',
  cholesterol: 'hasCholesterol',
  heartDisease: 'hasHeartDisease',
  kidneyDisease: 'hasKidneyDisease',
  acidReflux: 'hasAcidReflux',
  glutenIntolerance: 'hasGlutenIntolerance',
  lactoseIntolerance: 'hasLactoseIntolerance'
};

export {
  TestHelpers,
  testUsers,
  testMeals,
  healthConditions
};
