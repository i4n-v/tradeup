import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Registry } from '@/lib/registry/registry.lib';

import { useDashboardViewModel } from './dashboard.view-model';

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

const mockDashboardService = {
  getDashboard: jest.fn(),
};

const mockDashboardQueryKeys = {
  dashboard: () => ['dashboard'],
};

describe('useDashboardViewModel', () => {
  beforeEach(() => {
    const registry = Registry.getInstance();
    registry.clear();
    registry.register('dashboardService', mockDashboardService as any);
    registry.register('dashboardQueryKeys', mockDashboardQueryKeys as any);
    mockDashboardService.getDashboard.mockClear();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    Registry.getInstance().clear();
  });

  it('should expose dashboard data when query resolves', async () => {
    mockDashboardService.getDashboard.mockResolvedValue({
      brlBalance: '10000.00',
      btcBalance: '0.00000000',
      btcPriceBrl: '250000.00',
    });

    const { result } = renderHook(() => useDashboardViewModel(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.brlBalance).toBe('10000.00');
    expect(result.current.btcBalance).toBe('0.00000000');
    expect(result.current.btcPriceBrl).toBe('250000.00');
  });

  it('should expose null btcPriceBrl when price unavailable', async () => {
    mockDashboardService.getDashboard.mockResolvedValue({
      brlBalance: '10000.00',
      btcBalance: '0.00000000',
      btcPriceBrl: null,
    });

    const { result } = renderHook(() => useDashboardViewModel(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.btcPriceBrl).toBeNull();
  });
});
