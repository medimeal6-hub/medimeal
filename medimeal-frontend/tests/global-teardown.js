// Global teardown for Playwright tests
async function globalTeardown(config) {
  console.log('🧹 Starting global teardown...');
  
  // Clean up any global resources
  // Close any remaining browser instances
  // Clean up test data if needed
  
  console.log('✅ Global teardown completed');
}

export default globalTeardown;
