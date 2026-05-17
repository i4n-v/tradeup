import { renderHook, act, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Registry } from '@/lib/registry/registry.lib';

import { useBuyTradeViewModel } from './buy-trade.view-model';

jest.mock('@/lib/toast/toast.lib', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({}));

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  };
}

const mockTradeService = { buy: jest.fn() };
const mockDashboardQueryKeys = { dashboard: () => ['dashboard'] };
const mockDashboardService = {
  getDashboard: jest.fn().mockResolvedValue({
    brlBalance: '10000.00',
    btcBalance: '0',
    btcPriceBrl: '250000.00',
  }),
};

describe('useBuyTradeViewModel', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    const registry = Registry.getInstance();
    registry.clear();
    registry.register('tradeService', mockTradeService as any);
    registry.register('dashboardQueryKeys', mockDashboardQueryKeys as any);
    registry.register('dashboardService', mockDashboardService as any);
    mockTradeService.buy.mockClear();
    mockDashboardService.getDashboard.mockClear();

    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      const confirmButton = buttons?.find((b) => b.style !== 'cancel');
      confirmButton?.onPress?.();
    });
  });

  afterEach(() => {
    Registry.getInstance().clear();
    alertSpy.mockRestore();
  });

  it('should call tradeService.buy with amountBrl on submit', async () => {
    mockTradeService.buy.mockResolvedValue({
      transaction: {
        id: '1',
        type: 'BUY',
        status: 'PENDING',
        btcAmount: '0.00000000',
        brlAmount: '250.00',
        btcPriceBrl: '0.00',
        createdAt: '',
      },
    });

    const { result } = renderHook(() => useBuyTradeViewModel(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.form.setValue('amountBrl', '250.00');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    await waitFor(() => {
      expect(mockTradeService.buy).toHaveBeenCalledWith({ amountBrl: '250.00' });
    });
  });

  it('should show processing toast after successful buy', async () => {
    const { toast } = require('@/lib/toast/toast.lib');
    mockTradeService.buy.mockResolvedValue({
      transaction: {
        id: '1',
        type: 'BUY',
        status: 'PENDING',
        btcAmount: '0.00000000',
        brlAmount: '250.00',
        btcPriceBrl: '0.00',
        createdAt: '',
      },
    });

    const { result } = renderHook(() => useBuyTradeViewModel(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.form.setValue('amountBrl', '250.00');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });
});
