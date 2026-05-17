import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@hooks/use-query/use-query.hook';
import { useForm } from 'react-hook-form';
import { Alert } from 'react-native';

import { Registry } from '@lib/registry/registry.lib';
import { toast } from '@/lib/toast/toast.lib';
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
