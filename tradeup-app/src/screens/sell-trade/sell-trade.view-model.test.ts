import { renderHook, act, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Registry } from '@/lib/registry/registry.lib';

import { useSellTradeViewModel } from './sell-trade.view-model';

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

const mockTradeService = { sell: jest.fn() };
const mockDashboardQueryKeys = { dashboard: () => ['dashboard'] as const };
const mockDashboardService = {
  getDashboard: jest.fn().mockResolvedValue({
    brlBalance: '10000.00',
    btcBalance: '0.5',
    btcPriceBrl: '250000.00',
  }),
};

describe('useSellTradeViewModel', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    const registry = Registry.getInstance();
    registry.clear();
    registry.register('tradeService', mockTradeService as any);
    registry.register('dashboardQueryKeys', mockDashboardQueryKeys as any);
    registry.register('dashboardService', mockDashboardService as any);
    mockTradeService.sell.mockClear();
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

  it('should call tradeService.sell with amountBtc on submit', async () => {
    mockTradeService.sell.mockResolvedValue({
      transaction: {
        id: '1',
        type: 'SELL',
        btcAmount: '0.01',
        brlAmount: '2500.00',
        btcPriceBrl: '250000.00',
        createdAt: '',
      },
      wallet: { brlBalance: '12500.00', btcBalance: '0.49' },
    });

    const { result } = renderHook(() => useSellTradeViewModel(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.form.setValue('amountBtc', '0.01');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    await waitFor(() => {
      expect(mockTradeService.sell).toHaveBeenCalledWith({ amountBtc: '0.01000000' });
    });
  });
});
