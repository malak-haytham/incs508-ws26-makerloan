import axios from 'axios';

/** Cookies carry the JWTs; never store tokens in JS. */
export const api = axios.create({ baseURL: '/api', withCredentials: true });

let refreshing: Promise<unknown> | null = null;
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    const url: string = original?.url ?? '';
    if (error.response?.status === 401 && !original._retry && !url.includes('/auth/')) {
      original._retry = true;
      refreshing ??= api.post('/auth/refresh').finally(() => (refreshing = null));
      try { await refreshing; return api(original); } catch { /* fall through */ }
    }
    return Promise.reject(error);
  },
);

/** Backend error shape: { statusCode, message, error, timestamp, path } */
export const errorMessage = (e: any): string => {
  const m = e?.response?.data?.message;
  return Array.isArray(m) ? m.join(', ') : m ?? 'Something went wrong';
};
