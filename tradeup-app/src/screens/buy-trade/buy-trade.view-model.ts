import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Alert } from 'react-native';

import { Registry } from '@lib/registry/registry.lib';
import { toast } from '@/lib/toast/toast.lib';
import type { IDashboardDomainDTO } from '@/resources/services/dashboard/dtos/dashboard.domain.dto';
import { PT_BR } from '@/i18n/pt-BR';
import { getApiErrorMessage } from '@/utils/api-error/api-error.util';

import { buySchema, type IBuyFormValues, type IBuyTradeViewProps } from './buy-trade.model';

function useBuyTradeViewModel(): IBuyTradeViewProps {
  const queryClient = useQueryClient();
  const tradeService = Registry.getInstance().inject('tradeService');
  const dashboardService = Registry.getInstance().inject('dashboardService');
  const dashboardQueryKeys = Registry.getInstance().inject('dashboardQueryKeys');

  const { data: dashboard, refetch, isFetching } = useQuery({
    queryKey: dashboardQueryKeys.dashboard(),
    queryFn: () => dashboardService.getDashboard(),
    staleTime: 30_000,
  });

  const currentPrice = dashboard?.btcPriceBrl ?? null;

  const form = useForm<IBuyFormValues>({
    defaultValues: { amountBrl: '' },
    resolver: zodResolver(buySchema),
  });

  const amountBrl = form.watch('amountBrl');
  const estimatedBtc =
    currentPrice && amountBrl
      ? (Number.parseFloat(amountBrl) / Number.parseFloat(currentPrice)).toFixed(8)
      : '0.00000000';

  const mutation = useMutation({
    mutationFn: (data: IBuyFormValues) => tradeService.buy({ amountBrl: data.amountBrl }),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: dashboardQueryKeys.dashboard() });
      const snapshot = queryClient.getQueryData<IDashboardDomainDTO>(
        dashboardQueryKeys.dashboard(),
      );
      const price = currentPrice;
      if (snapshot && price) {
        const btcGain = (Number.parseFloat(data.amountBrl) / Number.parseFloat(price)).toFixed(8);
        queryClient.setQueryData(dashboardQueryKeys.dashboard(), {
          ...snapshot,
          brlBalance: (Number.parseFloat(snapshot.brlBalance) - Number.parseFloat(data.amountBrl)).toFixed(
            2,
          ),
          btcBalance: (Number.parseFloat(snapshot.btcBalance) + Number.parseFloat(btcGain)).toFixed(8),
        });
      }
      return { snapshot };
    },
    onError: (error, _, ctx) => {
      if (ctx?.snapshot) queryClient.setQueryData(dashboardQueryKeys.dashboard(), ctx.snapshot);
      toast.error(getApiErrorMessage(error, PT_BR.trade.error.generic));
    },
    onSuccess: () => {
      toast.success(PT_BR.trade.success.buy);
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: ['history'] });
      form.reset();
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    const brlFmt = Number.parseFloat(data.amountBrl).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    Alert.alert(PT_BR.trade.confirmBuyTitle, `Comprar ${estimatedBtc} BTC por R$ ${brlFmt}?`, [
      { text: PT_BR.trade.cancel, style: 'cancel' },
      { text: PT_BR.trade.confirm, onPress: () => mutation.mutate(data) },
    ]);
  });

  return {
    form,
    onSubmit,
    isPending: mutation.isPending,
    btcPriceBrl: currentPrice,
    estimatedBtc,
    onRefresh: () => {
      void refetch();
    },
    isRefreshing: isFetching,
  };
}

export { useBuyTradeViewModel };
