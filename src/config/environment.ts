// Environment Configuration
export const ENV_CONFIG = {
  // Detect environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || 'https://hamilton47.pythonanywhere.com',
  
  // Debug mode
  DEBUG: import.meta.env.DEV,
  
  // Timeouts
  API_TIMEOUT: 30000, // 30 seconds
  
  // Auto-refresh intervals
  ORDER_REFRESH_INTERVAL: 30000, // 30 seconds for order tracking
  
  // Console logging in production
  ENABLE_CONSOLE_LOG: import.meta.env.DEV,
};

// Console wrapper that respects environment
export const envConsole = {
  log: (...args: any[]) => {
    if (ENV_CONFIG.ENABLE_CONSOLE_LOG) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    console.error(...args);
  },
  warn: (...args: any[]) => {
    if (ENV_CONFIG.ENABLE_CONSOLE_LOG) {
      console.warn(...args);
    }
  }
};
