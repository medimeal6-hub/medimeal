# 🧪 MediMeal Playwright Testing Guide

## Overview
This guide covers the comprehensive Playwright testing setup for the MediMeal application, including end-to-end tests for all major features and user roles.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Backend server running on `http://localhost:5000`
- Frontend server running on `http://localhost:3000`

### Installation
```bash
# Install Playwright
npm install --save-dev @playwright/test

# Install browsers
npx playwright install
```

### Running Tests
```bash
# Run all tests
npm run test:e2e

# Run specific test suites
npm run test:e2e:auth
npm run test:e2e:dashboard
npm run test:e2e:health-survey
npm run test:e2e:admin
npm run test:e2e:doctor

# Run with UI
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# Generate report
npm run test:e2e:report
```

## 📁 Test Structure

```
tests/
├── auth.spec.js              # Authentication tests
├── dashboard.spec.js         # User dashboard tests
├── health-survey.spec.js     # Health survey tests
├── admin.spec.js             # Admin dashboard tests
├── doctor.spec.js            # Doctor dashboard tests
├── utils/
│   └── test-helpers.js       # Test utilities and helpers
├── fixtures/
│   └── test-fixtures.js      # Test fixtures and data
├── global-setup.js           # Global test setup
└── global-teardown.js        # Global test teardown
```

## 🎯 Test Coverage

### Authentication Tests (`auth.spec.js`)
- ✅ Login form validation
- ✅ User login (patient, doctor, admin)
- ✅ Registration process
- ✅ Password reset functionality
- ✅ Logout functionality
- ✅ Protected route access
- ✅ Role-based access control
- ✅ OAuth login options

### Dashboard Tests (`dashboard.spec.js`)
- ✅ Dashboard layout and navigation
- ✅ Featured menu display
- ✅ Meal filtering and sorting
- ✅ Meal management (add/remove)
- ✅ Progress statistics
- ✅ Search functionality
- ✅ Responsive design
- ✅ Navigation between pages

### Health Survey Tests (`health-survey.spec.js`)
- ✅ Survey display and dismissal
- ✅ Health condition selection
- ✅ Allergies and other conditions input
- ✅ Survey submission and persistence
- ✅ Meal filtering based on health data
- ✅ Pre-population of existing data
- ✅ Responsive design
- ✅ Error handling

### Admin Tests (`admin.spec.js`)
- ✅ Admin dashboard layout
- ✅ User management (CRUD operations)
- ✅ Doctor management
- ✅ Patient assignment system
- ✅ Prescription monitoring
- ✅ Conflict detection and resolution
- ✅ Analytics dashboard
- ✅ Responsive design

### Doctor Tests (`doctor.spec.js`)
- ✅ Doctor dashboard layout
- ✅ Patient management
- ✅ Schedule management
- ✅ Calendar integration
- ✅ Appointment management
- ✅ Billing management
- ✅ Data visualization
- ✅ Responsive design

## 🛠️ Test Utilities

### TestHelpers Class
The `TestHelpers` class provides reusable methods for common test operations:

```javascript
const helpers = new TestHelpers(page);

// Authentication
await helpers.loginAsUser();
await helpers.loginAsAdmin();
await helpers.loginAsDoctor();

// Navigation
await helpers.navigateToDashboard();
await helpers.navigateToMeals();

// Health Survey
await helpers.fillHealthSurvey(['hasSugar'], 'peanuts', 'anemia');
await helpers.closeHealthSurvey();

// Form Operations
await helpers.fillForm({ email: 'test@test.com', password: 'password' });
await helpers.clickButton('submit-button');
```

### Test Data Fixtures
Pre-defined test data for consistent testing:

```javascript
const { testUsers, testMeals, healthConditions } = require('./utils/test-helpers');

// Test users
testUsers.admin    // Admin user credentials
testUsers.doctor    // Doctor user credentials
testUsers.patient   // Patient user credentials

// Test meals
testMeals.grilledTurkey    // Turkey meal data
testMeals.breakfastBowl    // Breakfast meal data

// Health conditions
healthConditions.diabetes  // Diabetes condition key
healthConditions.bloodPressure  // Blood pressure condition key
```

## 🎭 Browser Support

Tests run on multiple browsers:
- **Chromium** (Desktop Chrome)
- **Firefox** (Desktop Firefox)
- **WebKit** (Desktop Safari)
- **Mobile Chrome** (Pixel 5)
- **Mobile Safari** (iPhone 12)

## 📊 Test Configuration

### Playwright Config (`playwright.config.js`)
- Base URL: `http://localhost:3000`
- Parallel execution enabled
- Retry on failure (2 retries on CI)
- Screenshots on failure
- Video recording on failure
- HTML, JSON, and JUnit reports

### Global Setup
- Backend server health check
- Test data initialization
- Global resource setup

### Global Teardown
- Cleanup of test data
- Resource cleanup
- Browser instance cleanup

## 🔧 Advanced Usage

### Custom Test Runner
Use the custom test runner for more control:

```bash
# Run all tests
node test-runner.js all

# Run specific test suite
node test-runner.js auth

# Run on specific browser
node test-runner.js browser chromium

# Run with UI
node test-runner.js ui

# Debug mode
node test-runner.js debug
```

### Test Data Management
Tests use isolated test data to avoid conflicts:

```javascript
// Each test gets fresh data
test.beforeEach(async ({ page }) => {
  helpers = new TestHelpers(page);
  await helpers.loginAsUser();
});
```

### Parallel Execution
Tests run in parallel by default for faster execution:

```javascript
// In playwright.config.js
fullyParallel: true,
workers: process.env.CI ? 1 : undefined,
```

## 🐛 Debugging Tests

### Debug Mode
```bash
npm run test:e2e:debug
```

### UI Mode
```bash
npm run test:e2e:ui
```

### Trace Viewer
```bash
npx playwright show-trace test-results/trace.zip
```

### Screenshots and Videos
- Screenshots: `test-results/screenshots/`
- Videos: `test-results/videos/`
- Traces: `test-results/traces/`

## 📈 Test Reports

### HTML Report
```bash
npm run test:e2e:report
```

### JSON Report
```bash
npx playwright test --reporter=json
```

### JUnit Report
```bash
npx playwright test --reporter=junit
```

## 🚨 Troubleshooting

### Common Issues

1. **Backend Server Not Running**
   ```bash
   cd medi/medimeal-backend
   npm start
   ```

2. **Frontend Server Not Running**
   ```bash
   cd medi/medimeal-frontend
   npm run dev
   ```

3. **Browser Installation Issues**
   ```bash
   npx playwright install --force
   ```

4. **Test Data Issues**
   - Ensure test users exist in database
   - Check test data fixtures
   - Verify API endpoints are working

### Test Environment Setup

1. **Start Backend Server**
   ```bash
   cd medi/medimeal-backend
   npm start
   ```

2. **Start Frontend Server**
   ```bash
   cd medi/medimeal-frontend
   npm run dev
   ```

3. **Run Tests**
   ```bash
   npm run test:e2e
   ```

## 📝 Writing New Tests

### Test Structure
```javascript
test.describe('Feature Name', () => {
  let helpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.loginAsUser();
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    await expect(page.locator('[data-testid="element"]')).toBeVisible();
  });
});
```

### Best Practices
1. Use `data-testid` attributes for reliable element selection
2. Use helper methods for common operations
3. Test both positive and negative scenarios
4. Include accessibility tests
5. Test responsive design
6. Clean up test data after each test

### Data Test IDs
Add `data-testid` attributes to your components:

```jsx
<button data-testid="login-button">Login</button>
<input data-testid="email-input" type="email" />
<div data-testid="user-profile">Profile</div>
```

## 🎯 Continuous Integration

### GitHub Actions Example
```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
    - run: npm ci
    - run: npx playwright install --with-deps
    - run: npm run test:e2e
    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
```

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright CI/CD](https://playwright.dev/docs/ci)

---

## 🎉 Conclusion

This comprehensive testing setup ensures the MediMeal application works correctly across all browsers and devices, with thorough coverage of all user roles and features. The tests are designed to be maintainable, reliable, and easy to extend as new features are added.




