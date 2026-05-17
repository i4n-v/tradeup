import type { ITransactionDomainDTO } from '@/resources/services/trade/dtos/trade.domain.dto';

export interface IHistoryViewProps {
  transactions: ITransactionDomainDTO[];
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}
