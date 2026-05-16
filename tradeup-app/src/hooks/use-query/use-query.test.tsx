import { renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useQuery } from './use-query.hook';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false, gcTime: 0 },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useQuery', () => {
  it('should return result with isPending and data', () => {
    const { result } = renderHook(
      () =>
        useQuery({
          queryKey: ['test'],
          queryFn: () => Promise.resolve('ok'),
        }),
      { wrapper: createWrapper() },
    );
    expect(result.current).toHaveProperty('isPending');
    expect(result.current).toHaveProperty('data');
  });
});
