import axios from 'axios';

const rawUrl = (import.meta.env.VITE_API_URL || '')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');

const BASE_URL = rawUrl ? `${rawUrl}/api` : '/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

const SKIP_REFRESH_URLS = ['/auth/refresh', '/auth/login', '/auth/register', '/auth/google'];

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const url = original?.url || '';

    if (
      err.response?.status === 401 &&
      !original._retry &&
      !SKIP_REFRESH_URLS.some(u => url.includes(u))
    ) {
      original._retry = true;
      try {
        await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        return api(original);
      } catch {
        window.location.href = '/login';
      }
    }

    return Promise.reject(err);
  }
);

export default api;
