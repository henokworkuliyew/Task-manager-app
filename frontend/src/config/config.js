// Configuration file for the application
export const config = {
  // API Configuration
  api: {
    // Development API URL
    development: 'http://localhost:5000/api',
    // Production API URL (your deployed backend)
    production: 'https://task-manager-backend-ubgg.onrender.com/api',
    // Timeout for API requests
    timeout: 10000,
  },
  
  // App Configuration
  app: {
    name: 'Task Manager',
    version: '1.0.0',
  },
  
  // Feature flags
  features: {
    enableDebugLogging: import.meta.env.DEV,
    enableErrorReporting: true,
  }
};

// Helper function to get the current API URL
export const getApiUrl = () => {
  if (import.meta.env.DEV) {
    return config.api.development;
  }
  return config.api.production;
};

// Export the current API URL
export const API_URL = getApiUrl();

// Log environment and configuration on import
if (import.meta.env.DEV) {
  console.log('🔧 Config loaded:', {
    apiUrl: API_URL,
    environment: import.meta.env.MODE,
    isDev: import.meta.env.DEV
  });
}
