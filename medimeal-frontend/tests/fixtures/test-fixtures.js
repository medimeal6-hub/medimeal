// Test fixtures for MediMeal tests
const { test as base } = require('@playwright/test');
const { TestHelpers, testUsers, testMeals, healthConditions } = require('./utils/test-helpers');

// Extend base test with custom fixtures
const test = base.extend({
  // Add authenticated page fixtures
  authenticatedUserPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const helpers = new TestHelpers(page);
    
    await helpers.loginAsUser();
    await use({ page, helpers });
    
    await context.close();
  },

  authenticatedAdminPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const helpers = new TestHelpers(page);
    
    await helpers.loginAsAdmin();
    await use({ page, helpers });
    
    await context.close();
  },

  authenticatedDoctorPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const helpers = new TestHelpers(page);
    
    await helpers.loginAsDoctor();
    await use({ page, helpers });
    
    await context.close();
  },

  // Add test data fixtures
  testUsers: async ({}, use) => {
    await use(testUsers);
  },

  testMeals: async ({}, use) => {
    await use(testMeals);
  },

  healthConditions: async ({}, use) => {
    await use(healthConditions);
  },

  // Add helpers fixture
  helpers: async ({ page }, use) => {
    const helpers = new TestHelpers(page);
    await use(helpers);
  }
});

module.exports = { test };




