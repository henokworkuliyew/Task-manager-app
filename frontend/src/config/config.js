
export const config = {

  api: {
    development: 'http://localhost:5000/api',
    // production: 'https://task-manager-backend-ubgg.onrender.com/api',
    production: 'https://task-manager-app-vtyc.onrender.com/api',
    timeout: 10000,
  }, 
  
  
  app: {
    name: 'Task Manager',
    version: '1.0.0',
  },
  
  features: {
    enableDebugLogging: import.meta.env.DEV,
    enableErrorReporting: true,
  }
};

export const getApiUrl = () => {
  if (import.meta.env.DEV) {
    return config.api.development;
  }
  return config.api.production;
};

export const API_URL = getApiUrl();

if (import.meta.env.DEV) {
  console.log('🔧 Config loaded:', {
    apiUrl: API_URL,
    environment: import.meta.env.MODE,
    isDev: import.meta.env.DEV
  });
}
