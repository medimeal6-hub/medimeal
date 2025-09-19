// Environment configuration for the application
export const config = {
  // API Configuration
  API_BASE_URL: import.meta.env?.VITE_API_URL || '/api',
  
  // App Configuration
  APP_NAME: import.meta.env?.VITE_APP_NAME || 'MediMeal',
  APP_VERSION: import.meta.env?.VITE_APP_VERSION || '1.0.0',
  
  // Development flags
  IS_DEVELOPMENT: import.meta.env?.DEV || false,
  IS_PRODUCTION: import.meta.env?.PROD || false,
  
  // Feature flags
  ENABLE_ANALYTICS: import.meta.env?.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG: import.meta.env?.VITE_ENABLE_DEBUG === 'true',
}

// Helper function to get environment variable with fallback
export const getEnvVar = (key, fallback = '') => {
  return import.meta.env?.[key] || fallback;
}

// Helper function to check if we're in browser environment
export const isBrowser = () => {
  return typeof window !== 'undefined';
}

export default config;
