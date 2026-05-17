import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useQuery } from '@tanstack/react-query';

import { Registry } from '@lib/registry/registry.lib';
import type { IAuthTabParamList } from '@/routes/navigation.types';

import type { IDashboardViewProps } from './dashboard.model';

function useDashboardViewModel(): IDashboardViewProps {
  const navigation = useNavigation<BottomTabNavigationProp<IAuthTabParamList>>();
  const dashboardService = Registry.getInstance().inject('dashboardService');
  const dashboardQueryKeys = Registry.getInstance().inject('dashboardQueryKeys');

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: dashboardQueryKeys.dashboard(),
    queryFn: () => dashboardService.getDashboard(),
    staleTime: 30_000,
  });

  return {
    brlBalance: data?.brlBalance ?? '—',
    btcBalance: data?.btcBalance ?? '—',
    btcPriceBrl: data?.btcPriceBrl ?? null,
    isLoading,
    isError,
    isRefetching,
    refetch,
    onBuyPress: () => navigation.navigate('BuyTrade'),
    onSellPress: () => navigation.navigate('BuyTrade'),
  };
}

export { useDashboardViewModel };
