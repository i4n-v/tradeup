import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@hooks/use-query/use-query.hook';
import { useForm } from 'react-hook-form';
import { Alert } from 'react-native';

import { Registry } from '@lib/registry/registry.lib';
import { toast } from '@/lib/toast/toast.lib';
import { PT_BR } from '@/i18n/pt-BR';
import { getApiErrorMessage } from '@/utils/api-error/api-error.util';

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
    onError: (error) => {
      toast.error(getApiErrorMessage(error, PT_BR.trade.error.generic));
    },
    onSuccess: () => {
      toast.success(PT_BR.trade.processing);
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
