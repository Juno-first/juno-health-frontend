import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import {
  parseAuthResponse,
  type LoginFormData,
  type AuthResponse,
  type RefreshRequest,
  type RegisterRequest,
} from '../../schemas/auth.schema';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Refresh queue (prevents multiple simultaneous refresh calls) ───────────────
let isRefreshing = false;

type QueueToken = string | null;
type QueueEntry = {
  resolve: (value: QueueToken) => void;
  reject:  (error: unknown)    => void;
};

let failedQueue: QueueEntry[] = [];

function processQueue(error: unknown, token: QueueToken = null): void {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  failedQueue = [];
}

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

// ── Request interceptor ────────────────────────────────────────────────────────
// Skip auth header on login / refresh endpoints; attach Bearer token everywhere else
api.interceptors.request.use(cfg => {
  const url = cfg.url ?? '';
  if (/\/(login|refresh)\/?$/.test(url)) return cfg;

  const token = localStorage.getItem('accessToken');
  if (token) {
    cfg.headers = cfg.headers ?? {};
    (cfg.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return cfg;
});

// ── Response interceptor ───────────────────────────────────────────────────────
// On 401, attempt a silent token refresh then replay the failed request.
// All requests that arrive while a refresh is in-flight are queued.
api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const original = (error.config ?? {}) as RetriableRequest;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh if the failing request IS the refresh endpoint
    if (original.url?.includes('/auth/refresh')) {
      clearTokens();
      return Promise.reject(error);
    }

    // Queue concurrent requests while refreshing
    if (isRefreshing) {
      return new Promise<QueueToken>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        if (!token) return Promise.reject(new Error('No token after refresh'));
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing     = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token stored');

      // JUNO refresh endpoint — note: body key is "refreshToken" (camelCase)
      const { data } = await axios.post<AuthResponse>(
        `${API_URL}/auth/refresh`,
        { refreshToken } satisfies RefreshRequest,
      );

      // Validate the response shape at runtime via Zod
      const parsed = parseAuthResponse(data);

      localStorage.setItem('accessToken',  parsed.accessToken);
      localStorage.setItem('refreshToken', parsed.refreshToken);

      processQueue(null, parsed.accessToken);

      original.headers = original.headers ?? {};
      (original.headers as Record<string, string>)['Authorization'] = `Bearer ${parsed.accessToken}`;
      return api(original);

    } catch (refreshError: unknown) {
      processQueue(refreshError, null);
      clearTokens();
      // Dispatch a custom event so any listener (e.g. the store) can redirect
      window.dispatchEvent(new Event('juno:session-expired'));
      return Promise.reject(refreshError);

    } finally {
      isRefreshing = false;
    }
  }
);

// ── Helper ─────────────────────────────────────────────────────────────────────
function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

// ── Exported API calls ─────────────────────────────────────────────────────────
export const userClient = {
  login: (data: LoginFormData) =>
    api.post<AuthResponse>("/auth/login", data).then((r) => parseAuthResponse(r.data)),

  refresh: (refreshToken: string) =>
    api
      .post<AuthResponse>("/auth/refresh", { refreshToken } satisfies RefreshRequest)
      .then((r) => parseAuthResponse(r.data)),

  register: (data: RegisterRequest) =>
    api.post<AuthResponse>("/auth/register", data).then((r) => parseAuthResponse(r.data)),
};
