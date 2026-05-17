export interface IDashboardViewProps {
  brlBalance: string;
  btcBalance: string;
  btcPriceBrl: string | null;
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => void;
  onBuyPress: () => void;
  onSellPress: () => void;
}
