import { useQuery as TanstackUseQuery } from '@tanstack/react-query';
import type {
  DefaultError,
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  QueryClient,
  QueryKey,
  UndefinedInitialDataOptions,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

const defaultQueryStates = {
  success: false,
  error: false,
  settled: false,
};

interface IQueryOptions<TError, TData> {
  onSuccess?(data: TData): void;
  onError?(error: TError): void;
  onSettled?(data: TData | undefined, error: TError | null): void;
}

function useQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey> &
    IQueryOptions<TError, TData>,
  queryClient?: QueryClient,
): DefinedUseQueryResult<TData, TError>;

function useQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UndefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey> &
    IQueryOptions<TError, TData>,
  queryClient?: QueryClient,
): UseQueryResult<TData, TError>;

function useQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  {
    onSuccess,
    onError,
    onSettled,
    ...options
  }: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & IQueryOptions<TError, TData>,
  queryClient?: QueryClient,
): UseQueryResult<TData, TError> {
  const events = useRef({
    ...defaultQueryStates,
  });
  const query = TanstackUseQuery(options, queryClient);

  useEffect(() => {
    if (!query.isFetching && query.isFetched) {
      if (onSuccess && query.isSuccess && !events.current.success) {
        events.current.success = true;
        onSuccess(query.data);
      }

      if (onError && query.isError && !events.current.error) {
        events.current.error = true;
        onError(query.error);
      }

      if (onSettled && (query.isSuccess || query.isError) && !events.current.settled) {
        events.current.settled = true;
        onSettled(query.data, query.error);
      }

      if (!query.isSuccess && !query.isError) {
        events.current = {
          ...defaultQueryStates,
        };
      }
    } else {
      events.current = {
        ...defaultQueryStates,
      };
    }

    return () => {
      events.current = {
        ...defaultQueryStates,
      };
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data, query.isFetching, query.isFetched, query.isSuccess, query.isError]);

  return query;
}

export { useQuery };
