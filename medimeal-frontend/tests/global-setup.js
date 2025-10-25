// Global setup for Playwright tests
import { chromium } from '@playwright/test';

async function globalSetup(config) {
  console.log('🚀 Starting global setup...');
  
  // Start backend server if needed
  const backendUrl = 'http://localhost:5000';
  
  try {
    const response = await fetch(`${backendUrl}/api/health`);
    if (!response.ok) {
      console.log('⚠️ Backend server not running. Please start it manually.');
      console.log('Run: cd medi/medimeal-backend && npm start');
    } else {
      console.log('✅ Backend server is running');
    }
  } catch (error) {
    console.log('⚠️ Backend server not accessible. Please start it manually.');
    console.log('Run: cd medi/medimeal-backend && npm start');
  }

  // Set up test data or perform any global initialization
  console.log('✅ Global setup completed');
}

export default globalSetup;
