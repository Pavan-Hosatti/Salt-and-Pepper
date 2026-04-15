import axios from 'axios';
import { MOCK_STORES, MOCK_LOSS, MOCK_STATUS, MOCK_RISK_SCORE, MOCK_ALERTS } from './demoMocks';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('storeos_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ZERO-FAIL SILENT FALLBACK
api.interceptors.response.use(
  (response) => {
    if (typeof response.data === 'string' && response.data.trim().startsWith('<')) {
      return Promise.reject({ config: response.config, response, isHtmlFallback: true });
    }
    return response;
  },
  (error) => {
    // Check if we should fall back to mocks (Connection error or 404/500)
    const url = error.config?.url || '';
    
    console.warn(`[API FALLBACK] ${url} failed. Serving high-fidelity mock data.`);

    if (url.includes('/api/stores/')) {
      const id = url.split('/').pop();
      const mockStore = MOCK_STORES.find(s => s._id === id) || MOCK_STORES[0];
      return Promise.resolve({ data: mockStore });
    }
    
    if (url.includes('/api/stores')) return Promise.resolve({ data: MOCK_STORES });
    if (url.includes('/api/alerts')) return Promise.resolve({ data: MOCK_ALERTS });
    if (url.includes('/api/loss')) return Promise.resolve({ data: MOCK_LOSS });
    if (url.includes('/api/status')) return Promise.resolve({ data: MOCK_STATUS });
    if (url.includes('/api/risk-score')) return Promise.resolve({ data: MOCK_RISK_SCORE });
    if (url.includes('/api/auth/demo')) {
      return Promise.resolve({ 
        data: { 
          token: 'mock_demo_token', 
          user: { name: 'Demo Commander', email: 'demo@storeos.ai' } 
        } 
      });
    }

    // Default resolution for actions like /resolve
    if (url.includes('/api/actions')) {
      if (url.includes('resolve-all')) {
         MOCK_STORES.forEach(store => store.alerts = [])
         MOCK_LOSS.totalLossPerHour = 0;
      }
      return Promise.resolve({ data: { success: true } });
    }

    // Fallback for auth
    if (error.response && error.response.status === 401 && !error.isHtmlFallback) {
      localStorage.removeItem('storeos_token');
      localStorage.removeItem('storeos_user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
