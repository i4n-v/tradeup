import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Alert } from 'react-native';

import { Registry } from '@lib/registry/registry.lib';
import { toast } from '@/lib/toast/toast.lib';
import type { IDashboardDomainDTO } from '@/resources/services/dashboard/dtos/dashboard.domain.dto';
import { PT_BR } from '@/i18n/pt-BR';

import { sellSchema, type ISellFormValues, type ISellTradeViewProps } from './sell-trade.model';

function useSellTradeViewModel(): ISellTradeViewProps {
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

  const form = useForm<ISellFormValues>({
    defaultValues: { amountBtc: '' },
    resolver: zodResolver(sellSchema),
  });

  const amountBtc = form.watch('amountBtc');
  const estimatedBrl =
    currentPrice && amountBtc
      ? (
          Number.parseFloat(amountBtc.replace(/\.$/, '')) * Number.parseFloat(currentPrice)
        ).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '0,00';

  const mutation = useMutation({
    mutationFn: (data: ISellFormValues) => {
      const normalized = Number.parseFloat(data.amountBtc.replace(/\.$/, '')).toFixed(8);
      return tradeService.sell({ amountBtc: normalized });
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: dashboardQueryKeys.dashboard() });
      const snapshot = queryClient.getQueryData<IDashboardDomainDTO>(
        dashboardQueryKeys.dashboard(),
      );
      const price = currentPrice;
      const amount = Number.parseFloat(data.amountBtc.replace(/\.$/, '')).toFixed(8);
      if (snapshot && price) {
        const brlGain = (Number.parseFloat(amount) * Number.parseFloat(price)).toFixed(2);
        queryClient.setQueryData(dashboardQueryKeys.dashboard(), {
          ...snapshot,
          btcBalance: (Number.parseFloat(snapshot.btcBalance) - Number.parseFloat(amount)).toFixed(8),
          brlBalance: (Number.parseFloat(snapshot.brlBalance) + Number.parseFloat(brlGain)).toFixed(2),
        });
      }
      return { snapshot };
    },
    onError: (_, __, ctx) => {
      if (ctx?.snapshot) queryClient.setQueryData(dashboardQueryKeys.dashboard(), ctx.snapshot);
      toast.error(PT_BR.trade.error.generic);
    },
    onSuccess: () => {
      toast.success(PT_BR.trade.success.sell);
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: ['history'] });
      form.reset();
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    const normalized = Number.parseFloat(data.amountBtc.replace(/\.$/, '')).toFixed(8);
    Alert.alert(PT_BR.trade.confirmSellTitle, `Vender ${normalized} BTC por ~R$ ${estimatedBrl}?`, [
      { text: PT_BR.trade.cancel, style: 'cancel' },
      { text: PT_BR.trade.confirm, onPress: () => mutation.mutate(data) },
    ]);
  });

  return {
    form,
    onSubmit,
    isPending: mutation.isPending,
    btcPriceBrl: currentPrice,
    estimatedBrl,
    onRefresh: () => {
      void refetch();
    },
    isRefreshing: isFetching,
  };
}

export { useSellTradeViewModel };
