import AsyncStorage from '@react-native-async-storage/async-storage';

import type { IHttpClient } from '@lib/http-client/http-client.interface.lib';
import { STORAGE_KEYS } from '@/configs/storage-keys.config';

/**
 * App-layer session: token persistence and HTTP bearer attachment.
 * Not an external API service; lives outside resources/services.
 */
export class AuthSession {
  private interceptorId: number | null = null;

  constructor(private readonly httpClient: IHttpClient) {}

  setupBearerInterceptor(): void {
    this.interceptorId = this.httpClient.onRequest(
      async (config) => {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          return { ...config, headers: { ...config.headers, Authorization: `Bearer ${token}` } };
        }
        return config;
      },
      (error) => Promise.reject(error),
    );
  }

  teardownBearerInterceptor(): void {
    if (this.interceptorId !== null) {
      this.httpClient.offRequest(this.interceptorId);
      this.interceptorId = null;
    }
  }

  async persistToken(token: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  async clearToken(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }
}
