import { tokenStorageService } from '../../core/token-storage.service';

const API_URL = process.env.EXPO_PUBLIC_API_URL ;//|| 'http://localhost:3000/api';
const FETCH_TIMEOUT_MS = 30000;

class ApiClient {
  private isRefreshing: boolean = false;
  private failedQueue: { resolve: (token: string) => void; reject: (error: any) => void }[] = [];

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeoutMs: number = FETCH_TIMEOUT_MS,
  ): Promise<Response> {
    if (timeoutMs <= 0) {
      return fetch(url, options);
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeoutMs / 1000} seconds`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const token = await tokenStorageService.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private addToQueue(resolve: (token: string) => void, reject: (error: any) => void): void {
    this.failedQueue.push({ resolve, reject });
  }

  private processQueue(token: string | null, error: any = null): void {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else if (token) {
        promise.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private async callRefreshToken(): Promise<{ access_token: string; refresh_token: string }> {
    const refreshToken = await tokenStorageService.getRefreshToken();
    if (!refreshToken) {
      const err = new Error('No refresh token available');
      (err as any).status = 401;
      throw err;
    }

    const response = await this.fetchWithTimeout(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const json = await response.json();
    if (!response.ok) {
      const err = new Error(json.message || 'Token refresh failed');
      (err as any).status = response.status;
      throw err;
    }
    return json.data;
  }

  private async handleTokenRefresh(): Promise<string> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;

      try {
        const tokens = await this.callRefreshToken();
        await tokenStorageService.setTokens(tokens.access_token, tokens.refresh_token);
        this.processQueue(tokens.access_token);
        return tokens.access_token;
      } catch (error: any) {
        this.processQueue(null, error);
        // Only clear tokens if we are sure it's an authentication error (e.g. 400, 401, 403 status code)
        if (error.message === 'No refresh token available' || (error.status && [400, 401, 403].includes(error.status))) {
          await tokenStorageService.clearTokens();
        }
        throw error;
      } finally {
        this.isRefreshing = false;
      }
    }

    return new Promise((resolve, reject) => {
      this.addToQueue(resolve, reject);
    });
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: unknown,
    timeoutMs?: number,
  ): Promise<T> {
    const makeRequest = async (): Promise<Response> => {
      const headers = await this.getHeaders();
      return this.fetchWithTimeout(`${API_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      }, timeoutMs);
    };

    let response = await makeRequest();

    if (response.status === 401) {
      const token = await tokenStorageService.getAccessToken();
      if (!token) {
        const json = await response.json();
        throw new Error(json.message || 'No autorizado');
      }
      try {
        await this.handleTokenRefresh();
        response = await makeRequest();
      } catch (refreshError: any) {
        // If it was a deliberate authentication failure, throw session expired error
        if (
          refreshError.message === 'No refresh token available' ||
          (refreshError.status && [400, 401, 403].includes(refreshError.status))
        ) {
          const sessionErr = new Error('Sesión expirada. Inicia sesión de nuevo.');
          (sessionErr as any).status = 401;
          throw sessionErr;
        }
        // Otherwise, propagate the original network/timeout/server error
        throw refreshError;
      }
    }

    const json = await response.json();
    if (!response.ok) {
      const requestErr = new Error(json.message || 'Request failed');
      (requestErr as any).status = response.status;
      throw requestErr;
    }
    return json.data;
  }

  setToken(token: string | null) {
  }

  async get<T>(endpoint: string, timeoutMs?: number): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, timeoutMs);
  }

  async post<T>(endpoint: string, body?: unknown, timeoutMs?: number): Promise<T> {
    return this.request<T>('POST', endpoint, body, timeoutMs);
  }

  async put<T>(endpoint: string, body?: unknown, timeoutMs?: number): Promise<T> {
    return this.request<T>('PUT', endpoint, body, timeoutMs);
  }

  async delete<T>(endpoint: string, body?: unknown, timeoutMs?: number): Promise<T> {
    return this.request<T>('DELETE', endpoint, body, timeoutMs);
  }
}

export const apiClient = new ApiClient();
