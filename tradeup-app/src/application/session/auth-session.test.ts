import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthSession } from './auth-session';
import { STORAGE_KEYS } from '@/configs/storage-keys.config';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

function createMockHttpClient() {
  return {
    onRequest: jest.fn(() => 7),
    offRequest: jest.fn(),
  };
}

describe('AuthSession', () => {
  beforeEach(() => {
    jest.mocked(AsyncStorage.getItem).mockReset();
    jest.mocked(AsyncStorage.setItem).mockReset();
    jest.mocked(AsyncStorage.removeItem).mockReset();
  });

  it('should register a request interceptor when setupBearerInterceptor runs', () => {
    const http = createMockHttpClient();
    const session = new AuthSession(http as any);

    session.setupBearerInterceptor();

    expect(http.onRequest).toHaveBeenCalledTimes(1);
  });

  it('should remove interceptor when teardownBearerInterceptor runs', () => {
    const http = createMockHttpClient();
    const session = new AuthSession(http as any);
    session.setupBearerInterceptor();

    session.teardownBearerInterceptor();

    expect(http.offRequest).toHaveBeenCalledWith(7);
  });

  it('should persist token to AsyncStorage', async () => {
    const session = new AuthSession(createMockHttpClient() as any);

    await session.persistToken('abc');

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN, 'abc');
  });

  it('should clear token from AsyncStorage', async () => {
    const session = new AuthSession(createMockHttpClient() as any);

    await session.clearToken();

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN);
  });
});
