/**
 * Secure Authentication Service with httpOnly Cookies
 * 
 * This service handles secure token management using httpOnly cookies
 * instead of localStorage to prevent XSS attacks.
 * 
 * Features:
 * - Automatic token refresh
 * - CSRF token handling
 * - Secure cookie management
 * - Request/response interceptors
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
});

// Track token refresh to prevent multiple simultaneous refreshes
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  isRefreshing = false;
  failedQueue = [];
};

/**
 * Request Interceptor:
 * - Add CSRF token to requests (django-middleware requirement)
 * - Add Authorization header if token exists
 */
api.interceptors.request.use(
  (config) => {
    // Add CSRF token if available
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * - Handle 401 errors with automatic token refresh
 * - Queue failed requests during refresh
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response } = error;

    if (response?.status === 401 && !config._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            config.headers['Authorization'] = `Bearer ${token}`;
            return api(config);
          })
          .catch(err => Promise.reject(err));
      }

      config._retry = true;
      isRefreshing = true;

      // Try to refresh the token
      return refreshAccessToken()
        .then(token => {
          config.headers['Authorization'] = `Bearer ${token}`;
          processQueue(null, token);
          return api(config);
        })
        .catch(err => {
          processQueue(err, null);
          // Clear local Redux state and redirect to login
          window.location.href = '/login';
          return Promise.reject(err);
        });
    }

    return Promise.reject(error);
  }
);

/**
 * Get CSRF token from cookies
 */
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

/**
 * Login - authenticate and receive httpOnly cookies
 */
export async function login(email, password) {
  try {
    const response = await api.post('/auth/login/', { email, password });
    
    // Tokens are now in httpOnly cookies set by server
    // Response contains user and permissions data
    return {
      success: true,
      user: response.data.user,
      permissions: response.data.permissions,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Login failed',
    };
  }
}

/**
 * Logout - clear session
 */
export async function logout() {
  try {
    await api.post('/auth/logout/', {});
    return { success: true };
  } catch (error) {
    // Even if logout fails, clear local state
    return { success: false, error: error.message };
  }
}

/**
 * Refresh access token (called automatically)
 */
async function refreshAccessToken() {
  try {
    const response = await api.post('/auth/refresh/', {});
    return response.data.access;
  } catch (error) {
    throw error;
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  try {
    const response = await api.get('/auth/me/');
    return response.data;
  } catch (error) {
    return null;
  }
}

/**
 * Helper to build query strings for GET requests
 */
export function buildQueryString(params = {}) {
  const filtered = Object.entries(params)
    .filter(([_, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  
  return filtered ? `?${filtered}` : '';
}

export default api;
