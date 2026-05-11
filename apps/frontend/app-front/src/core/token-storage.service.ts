import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

class TokenStorageService {
  private inMemoryTokens: { accessToken: string | null; refreshToken: string | null } = {
    accessToken: null,
    refreshToken: null,
  };
  private useSecureStorage: boolean = Platform.OS !== 'web';
  private persistToStorage: boolean = true;

  private getWebStorage(): Storage | null {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return window.localStorage;
    }
    return null;
  }

  setUseSecureStorage(use: boolean): void {
    this.useSecureStorage = use;
  }

  setPersistToStorage(persist: boolean): void {
    this.persistToStorage = persist;
  }

  isUsingSecureStorage(): boolean {
    return this.useSecureStorage;
  }

  isPersistingToStorage(): boolean {
    return this.persistToStorage;
  }

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    if (this.persistToStorage) {
      try {
        if (Platform.OS === 'web') {
          const storage = this.getWebStorage();
          if (storage) {
            storage.setItem(ACCESS_TOKEN_KEY, accessToken);
            storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
          }
        } else {
          await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
          await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
        }
      } catch (error) {
        console.warn('Failed to persist tokens:', error);
      }
    }
    this.inMemoryTokens = { accessToken, refreshToken };
  }

  async getAccessToken(): Promise<string | null> {
    if (this.inMemoryTokens.accessToken) {
      return this.inMemoryTokens.accessToken;
    }
    if (!this.persistToStorage) {
      return null;
    }
    try {
      let token: string | null = null;
      if (Platform.OS === 'web') {
        const storage = this.getWebStorage();
        if (storage) {
          token = storage.getItem(ACCESS_TOKEN_KEY);
        }
      } else {
        token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      }
      this.inMemoryTokens.accessToken = token;
      return token;
    } catch (error) {
      console.warn('Failed to get access token:', error);
      return null;
    }
  }

  async getRefreshToken(): Promise<string | null> {
    if (this.inMemoryTokens.refreshToken) {
      return this.inMemoryTokens.refreshToken;
    }
    if (!this.persistToStorage) {
      return null;
    }
    try {
      let token: string | null = null;
      if (Platform.OS === 'web') {
        const storage = this.getWebStorage();
        if (storage) {
          token = storage.getItem(REFRESH_TOKEN_KEY);
        }
      } else {
        token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      }
      this.inMemoryTokens.refreshToken = token;
      return token;
    } catch (error) {
      console.warn('Failed to get refresh token:', error);
      return null;
    }
  }

  async clearTokens(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        const storage = this.getWebStorage();
        if (storage) {
          storage.removeItem(ACCESS_TOKEN_KEY);
          storage.removeItem(REFRESH_TOKEN_KEY);
        }
      } else {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      }
    } catch (error) {
      console.warn('Failed to clear tokens:', error);
    }
    this.inMemoryTokens = { accessToken: null, refreshToken: null };
  }

  async loadStoredTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    try {
      if (Platform.OS === 'web') {
        const storage = this.getWebStorage();
        if (storage) {
          accessToken = storage.getItem(ACCESS_TOKEN_KEY);
          refreshToken = storage.getItem(REFRESH_TOKEN_KEY);
        }
      } else {
        accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      }
    } catch (error) {
      console.warn('Failed to load stored tokens:', error);
    }

    this.inMemoryTokens = { accessToken, refreshToken };
    this.persistToStorage = !!(accessToken || refreshToken);
    return { accessToken, refreshToken };
  }
}

export const tokenStorageService = new TokenStorageService();
