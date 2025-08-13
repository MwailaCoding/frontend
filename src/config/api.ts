// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://hamilton47.pythonanywhere.com' : 'http://localhost:5000'),
  ENDPOINTS: {
    // Auth
    LOGIN: '/api/auth/login',
    VALIDATE_TOKEN: '/api/auth/validate',
    
    // Products
    PRODUCTS: '/api/products',
    PRODUCT_DETAIL: (id: string) => `/api/products/${id}`,
    ADMIN_PRODUCTS: '/api/admin/products',
    ADMIN_PRODUCT_DETAIL: (id: string) => `/api/admin/products/${id}`,
    ADMIN_PRODUCT_AVAILABILITY: (id: string) => `/api/admin/products/${id}/availability`,
    
    // Categories
    CATEGORIES: '/api/categories',
    
    // Orders
    ORDERS: '/api/orders',
    ORDER_DETAIL: (id: string) => `/api/orders/${id}`,
    ORDER_BY_PHONE: '/api/orders/by-phone',
    UPDATE_ORDER_STATUS: (id: string) => `/api/orders/${id}/status`,
    ADMIN_ORDERS: '/api/admin/orders',
    ADMIN_ORDER_STATUS: (id: string) => `/api/admin/orders/${id}/status`,
    ADMIN_ORDER_PRIORITY: (id: string) => `/api/admin/orders/${id}/priority`,
    ADMIN_BULK_ORDER_STATUS: '/api/admin/orders/bulk-status',
    ADMIN_ORDER_ANALYTICS: '/api/admin/orders/analytics',
    
    // Payment Requests
    PAYMENT_REQUESTS: '/api/payment-requests',
    PAYMENT_REQUEST_BY_ORDER: (orderId: string) => `/api/payment-requests/${orderId}`,
    ADMIN_PAYMENT_REQUESTS: '/api/admin/payment-requests',
    ADMIN_PAYMENT_REQUEST_UPDATE: (id: string) => `/api/admin/payment-requests/${id}`,
    
    // Payment Verification
    VERIFY_TRANSACTION: '/api/payment/verify-transaction',
    ADMIN_PAYMENT_VERIFICATIONS: '/api/admin/payment-verifications',
    ADMIN_VERIFY_PAYMENT: (id: string) => `/api/admin/verify-payment/${id}`,
    
    // MPESA
    MPESA_PAYMENT: '/api/mpesa/request-payment',
    
    // Uploads
    UPLOADS: '/uploads',
    THUMBNAILS: '/uploads/thumbnails',
    
    // WhatsApp
    WHATSAPP_CHATS: '/api/admin/whatsapp/chats',
    WHATSAPP_CHAT_STATUS: (id: string) => `/api/admin/whatsapp/chats/${id}/status`,
    WHATSAPP_STATS: '/api/admin/whatsapp/stats',
    WHATSAPP_TEMPLATES: '/api/admin/whatsapp/templates',
    
    // Receipts
    RECEIPT: (id: string) => `/api/receipt/${id}`,
    RECEIPT_DOWNLOAD: (id: string) => `/api/receipt/${id}/download`
  }
};

// Enhanced API utility functions with automatic retry and better error handling
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
  retryCount = 0,
  maxRetries = 3
): Promise<Response> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    // Log API calls for debugging
    console.log(`API Call: ${response.status} ${response.statusText} - ${url}`);
    
    // Handle retryable errors
    if (shouldRetry(response.status) && retryCount < maxRetries) {
      const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
      console.log(`Retrying ${url} in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return apiRequest(endpoint, options, retryCount + 1, maxRetries);
    }
    
    return response;
  } catch (error) {
    // Handle network errors with retry
    if (retryCount < maxRetries) {
      const delay = Math.pow(2, retryCount) * 1000;
      console.log(`Network error, retrying ${url} in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return apiRequest(endpoint, options, retryCount + 1, maxRetries);
    }
    
    console.error(`API Request failed for ${url} after ${maxRetries} retries:`, error);
    throw error;
  }
};

// Determine if an error status should trigger a retry
const shouldRetry = (status: number): boolean => {
  // Retry on server errors and temporary issues
  return status >= 500 || status === 429; // 5xx errors + rate limiting
};

// Enhanced API functions with better error messages
export const apiGet = (endpoint: string, options: RequestInit = {}) => 
  apiRequest(endpoint, { method: 'GET', ...options });

export const apiPost = (endpoint: string, data: any, options: RequestInit = {}) => 
  apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });

export const apiPut = (endpoint: string, data: any, options: RequestInit = {}) => 
  apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });

export const apiDelete = (endpoint: string, options: RequestInit = {}) => 
  apiRequest(endpoint, { method: 'DELETE', ...options });

// Auth utility
export const getAuthHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

// Image URL utility - handles both development and production
export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return '/logo.png'; // Only for products with no image
  }
  
  // Always use the full backend URL since that's where images are stored
  return `https://hamilton47.pythonanywhere.com/${imagePath}`;
};