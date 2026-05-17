import { renderHook, act, waitFor } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Registry } from '@/lib/registry/registry.lib';

import { useLoginViewModel } from './login.view-model';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('@/lib/toast/toast.lib', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/stores/session.store', () => ({
  useSessionStore: (selector: any) => {
    const state = { token: null, isAuthenticated: false, setSession: jest.fn(), clearSession: jest.fn() };
    return selector(state);
  },
}));

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  };
}

const mockAuthService = {
  login: jest.fn(),
};

const mockAuthSession = {
  persistToken: jest.fn().mockResolvedValue(undefined),
};

describe('useLoginViewModel', () => {
  beforeEach(() => {
    const registry = Registry.getInstance();
    registry.clear();
    registry.register('authService', mockAuthService as any);
    registry.register('authSession', mockAuthSession as any);
    mockAuthService.login.mockClear();
    mockAuthSession.persistToken.mockClear();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    Registry.getInstance().clear();
  });

  it('should call authService.login with form credentials', async () => {
    mockAuthService.login.mockResolvedValue({
      token: 'test-token',
      user: { id: '1', name: 'Ana', email: 'ana@test.com', avatarUrl: null, createdAt: '' },
    });

    const { result } = renderHook(() => useLoginViewModel(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.form.setValue('email', 'ana@test.com');
      result.current.form.setValue('password', 'senha1234');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'ana@test.com',
        password: 'senha1234',
      });
    });
  });

  it('should persist token via authSession on successful login', async () => {
    mockAuthService.login.mockResolvedValue({
      token: 'test-token',
      user: { id: '1', name: 'Ana', email: 'ana@test.com', avatarUrl: null, createdAt: '' },
    });

    const { result } = renderHook(() => useLoginViewModel(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.form.setValue('email', 'ana@test.com');
      result.current.form.setValue('password', 'senha1234');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    await waitFor(() => {
      expect(mockAuthSession.persistToken).toHaveBeenCalledWith('test-token');
    });
  });

  it('should show error toast on login failure', async () => {
    const { toast } = require('@/lib/toast/toast.lib');
    mockAuthService.login.mockRejectedValue(new Error('Credenciais inválidas'));

    const { result } = renderHook(() => useLoginViewModel(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.form.setValue('email', 'ana@test.com');
      result.current.form.setValue('password', 'senha1234');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
