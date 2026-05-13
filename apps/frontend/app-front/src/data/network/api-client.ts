import { tokenStorageService } from '../../core/token-storage.service';

const API_URL = process.env.EXPO_PUBLIC_API_URL ;//|| 'http://localhost:3000/api';
const FETCH_TIMEOUT_MS = 10000;

class ApiClient {
  private isRefreshing: boolean = false;
  private failedQueue: { resolve: (token: string) => void; reject: (error: any) => void }[] = [];

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timed out after ${FETCH_TIMEOUT_MS / 1000} seconds`);
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
      throw new Error('No refresh token available');
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
      throw new Error(json.message || 'Token refresh failed');
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
      } catch (error) {
        this.processQueue(null, error);
        await tokenStorageService.clearTokens();
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
  ): Promise<T> {
    const makeRequest = async (): Promise<Response> => {
      const headers = await this.getHeaders();
      return this.fetchWithTimeout(`${API_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    };

    let response = await makeRequest();

    if (response.status === 401) {
      try {
        await this.handleTokenRefresh();
        response = await makeRequest();
      } catch (refreshError) {
        throw new Error('Session expired. Please login again.');
      }
    }

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Request failed');
    }
    return json.data;
  }

  setToken(token: string | null) {
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', endpoint, body);
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>('PUT', endpoint, body);
  }

  async delete<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>('DELETE', endpoint, body);
  }
}

export const apiClient = new ApiClient();
