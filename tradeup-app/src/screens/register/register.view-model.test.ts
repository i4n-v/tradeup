import { renderHook, act, waitFor } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Registry } from '@/lib/registry/registry.lib';

import { useRegisterViewModel } from './register.view-model';

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  };
}

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

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAuthService = {
  register: jest.fn(),
};

describe('useRegisterViewModel', () => {
  beforeEach(() => {
    const registry = Registry.getInstance();
    registry.clear();
    registry.register('authService', mockAuthService as any);
    mockAuthService.register.mockClear();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    Registry.getInstance().clear();
  });

  it('should call authService.register with form data on submit', async () => {
    mockAuthService.register.mockResolvedValue({ token: 'tok', user: { id: '1', name: 'Ana', email: 'ana@test.com', avatarUrl: null, createdAt: '' } });

    const { result } = renderHook(() => useRegisterViewModel(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.form.setValue('name', 'Ana Silva');
      result.current.form.setValue('email', 'ana@test.com');
      result.current.form.setValue('password', 'senha1234');
      result.current.form.setValue('password_confirmation', 'senha1234');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    await waitFor(() => {
      expect(mockAuthService.register).toHaveBeenCalledWith({
        name: 'Ana Silva',
        email: 'ana@test.com',
        password: 'senha1234',
        password_confirmation: 'senha1234',
      });
    });
  });

  it('should navigate to Login and show success toast on success', async () => {
    const { toast } = require('@/lib/toast/toast.lib');
    mockAuthService.register.mockResolvedValue({ token: 'tok', user: { id: '1', name: 'Ana', email: 'ana@test.com', avatarUrl: null, createdAt: '' } });

    const { result } = renderHook(() => useRegisterViewModel(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.form.setValue('name', 'Ana Silva');
      result.current.form.setValue('email', 'ana@test.com');
      result.current.form.setValue('password', 'senha1234');
      result.current.form.setValue('password_confirmation', 'senha1234');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('Login');
    });
  });

  it('should show error toast on registration failure', async () => {
    const { toast } = require('@/lib/toast/toast.lib');
    mockAuthService.register.mockRejectedValue(new Error('E-mail já utilizado'));

    const { result } = renderHook(() => useRegisterViewModel(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.form.setValue('name', 'Ana Silva');
      result.current.form.setValue('email', 'ana@test.com');
      result.current.form.setValue('password', 'senha1234');
      result.current.form.setValue('password_confirmation', 'senha1234');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
