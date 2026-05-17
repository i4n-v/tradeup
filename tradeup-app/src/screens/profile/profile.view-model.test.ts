import { renderHook, act, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Registry } from '@/lib/registry/registry.lib';

import { useProfileViewModel } from './profile.view-model';

jest.mock('@/stores/session.store', () => ({
  useSessionStore: (selector: any) => {
    const state = { clearSession: jest.fn() };
    return selector(state);
  },
}));

jest.mock('@/lib/toast/toast.lib', () => ({
  toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  };
}

const mockProfileService = {
  getProfile: jest.fn(),
  updateName: jest.fn(),
};

const mockProfileQueryKeys = {
  profile: () => ['profile', 'me'] as const,
};

const mockAuthSession = {
  clearToken: jest.fn().mockResolvedValue(undefined),
};

describe('useProfileViewModel', () => {
  beforeEach(() => {
    const registry = Registry.getInstance();
    registry.clear();
    registry.register('profileService', mockProfileService as any);
    registry.register('profileQueryKeys', mockProfileQueryKeys as any);
    registry.register('authSession', mockAuthSession as any);
    mockProfileService.getProfile.mockResolvedValue({
      name: 'Ana',
      email: 'ana@test.com',
      avatarUrl: null,
    });
    mockAuthSession.clearToken.mockClear();

    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      const destructive = buttons?.find((b) => b.style === 'destructive');
      destructive?.onPress?.();
    });
  });

  afterEach(() => {
    Registry.getInstance().clear();
    jest.restoreAllMocks();
  });

  it('should call authSession.clearToken when logout is confirmed', async () => {
    const { result } = renderHook(() => useProfileViewModel(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      result.current.onLogout();
    });

    await waitFor(() => {
      expect(mockAuthSession.clearToken).toHaveBeenCalled();
    });
  });
});
