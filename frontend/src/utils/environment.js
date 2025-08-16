// Environment detection and logging utility

export const environment = {
  // Check if we're in development mode
  isDev: import.meta.env.DEV,
  
  // Check if we're in production mode
  isProd: import.meta.env.PROD,
  
  // Get the current mode
  mode: import.meta.env.MODE,
  
  // Get the base URL
  base: import.meta.env.BASE_URL,
  
  // Check if we're running locally
  isLocal: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
  
  // Check if we're running on Render
  isRender: window.location.hostname.includes('onrender.com'),
};

// Log environment information
export const logEnvironment = () => {
  console.log('🌍 Environment Information:', {
    mode: environment.mode,
    isDev: environment.isDev,
    isProd: environment.isProd,
    isLocal: environment.isLocal,
    isRender: environment.isRender,
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    port: window.location.port,
    fullUrl: window.location.href
  });
};

// Export the environment object
export default environment;

