import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@hooks/use-query/use-query.hook';
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { Registry } from '@lib/registry/registry.lib';
import { toast } from '@/lib/toast/toast.lib';
import { PT_BR } from '@/i18n/pt-BR';
import { getApiErrorMessage } from '@/utils/api-error/api-error.util';

import {
  convertSchema,
  type IConvertDirection,
  type IConvertFormValues,
  type IConvertTradeViewProps,
} from './convert-trade.model';

function useConvertTradeViewModel(): IConvertTradeViewProps {
  const queryClient = useQueryClient();
  const [direction, setDirection] = useState<IConvertDirection>('brl-to-btc');
  const tradeService = Registry.getInstance().inject('tradeService');
  const dashboardService = Registry.getInstance().inject('dashboardService');
  const dashboardQueryKeys = Registry.getInstance().inject('dashboardQueryKeys');

  const { data: dashboard, refetch, isFetching } = useQuery({
    queryKey: dashboardQueryKeys.dashboard(),
    queryFn: () => dashboardService.getDashboard(),
    staleTime: 30_000,
  });

  const currentPrice = dashboard?.btcPriceBrl ?? null;

  const form = useForm<IConvertFormValues>({
    defaultValues: { amount: '' },
    resolver: zodResolver(convertSchema),
  });

  const amount = form.watch('amount');

  const estimatedCounter = useMemo(() => {
    if (!currentPrice || !amount) {
      return direction === 'brl-to-btc' ? '0.00000000' : '0,00';
    }
    const n = Number.parseFloat(String(amount).replace(/\.$/, ''));
    if (!Number.isFinite(n) || n <= 0) {
      return direction === 'brl-to-btc' ? '0.00000000' : '0,00';
    }
    if (direction === 'brl-to-btc') {
      return (n / Number.parseFloat(currentPrice)).toFixed(8);
    }
    return (n * Number.parseFloat(currentPrice)).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [amount, currentPrice, direction]);

  const buyMutation = useMutation({
    mutationFn: (amountBrl: string) => tradeService.buy({ amountBrl }),
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

  const sellMutation = useMutation({
    mutationFn: (amountBtc: string) => tradeService.sell({ amountBtc }),
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

  const onDirectionChange = (d: IConvertDirection) => {
    setDirection(d);
    form.reset({ amount: '' });
  };

  const onSubmit = form.handleSubmit((data) => {
    if (direction === 'brl-to-btc') {
      const amountBrl = Number.parseFloat(data.amount).toFixed(2);
      Alert.alert(PT_BR.trade.confirmBuyTitle, `Converter R$ ${amountBrl} em ~₿ ${estimatedCounter}?`, [
        { text: PT_BR.trade.cancel, style: 'cancel' },
        { text: PT_BR.trade.confirm, onPress: () => buyMutation.mutate(amountBrl) },
      ]);
      return;
    }

    const amountBtc = Number.parseFloat(data.amount.replace(/\.$/, '')).toFixed(8);
    Alert.alert(PT_BR.trade.confirmSellTitle, `Converter ₿ ${amountBtc} em ~R$ ${estimatedCounter}?`, [
      { text: PT_BR.trade.cancel, style: 'cancel' },
      { text: PT_BR.trade.confirm, onPress: () => sellMutation.mutate(amountBtc) },
    ]);
  });

  const isPending = buyMutation.isPending || sellMutation.isPending;

  return {
    form,
    direction,
    onDirectionChange,
    onSubmit,
    isPending,
    btcPriceBrl: currentPrice,
    estimatedCounter,
    counterLabel:
      direction === 'brl-to-btc' ? PT_BR.trade.estimatedBtc : PT_BR.trade.estimatedBrl,
    amountLabel:
      direction === 'brl-to-btc' ? PT_BR.trade.brlAmount : PT_BR.trade.btcAmount,
    moneyFormat: direction === 'brl-to-btc' ? 'brl' : 'btc',
    submitLabel: PT_BR.trade.convertTitle,
    variant: direction === 'brl-to-btc' ? 'primary' : 'danger',
    onRefresh: () => {
      void refetch();
    },
    isRefreshing: isFetching,
  };
}

export { useConvertTradeViewModel };
