import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Registry } from '@/lib/registry/registry.lib';

import { useHistoryViewModel } from './history.view-model';

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  };
}

const mockHistoryService = {
  getHistory: jest.fn(),
};

const mockHistoryQueryKeys = {
  list: (page: number, limit: number) => ['history', 'list', page, limit] as const,
};

describe('useHistoryViewModel', () => {
  beforeEach(() => {
    const registry = Registry.getInstance();
    registry.clear();
    registry.register('historyService', mockHistoryService as any);
    registry.register('historyQueryKeys', mockHistoryQueryKeys as any);
    mockHistoryService.getHistory.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    Registry.getInstance().clear();
  });

  it('should expose transactions from historyService', async () => {
    mockHistoryService.getHistory.mockResolvedValue({
      data: [
        {
          id: '1',
          type: 'BUY',
          btcAmount: '0.01',
          brlAmount: '500',
          btcPriceBrl: '50000',
          createdAt: '2026-01-01T12:00:00Z',
        },
      ],
    });

    const { result } = renderHook(() => useHistoryViewModel(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.transactions).toHaveLength(1);
    expect(result.current.transactions[0]?.id).toBe('1');
  });
});
