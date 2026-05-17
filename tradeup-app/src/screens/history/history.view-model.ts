import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Registry } from '@lib/registry/registry.lib';

import type { IHistoryViewProps } from './history.model';

function useHistoryViewModel(): IHistoryViewProps {
  const [page, setPage] = useState(1);
  const limit = 50;
  const historyService = Registry.getInstance().inject('historyService');
  const historyQueryKeys = Registry.getInstance().inject('historyQueryKeys');

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: historyQueryKeys.list(page, limit),
    queryFn: () => historyService.getHistory({ page, limit }),
  });

  return {
    transactions: data?.data ?? [],
    isLoading,
    isError,
    hasMore: (data?.data.length ?? 0) >= limit,
    onLoadMore: () => setPage((p) => p + 1),
    onRefresh: () => {
      setPage(1);
      refetch();
    },
    isRefreshing: isRefetching,
  };
}

export { useHistoryViewModel };
