import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { Registry } from '@lib/registry/registry.lib';
import { toast } from '@/lib/toast/toast.lib';
import type { IDashboardDomainDTO } from '@/resources/services/dashboard/dtos/dashboard.domain.dto';
import { PT_BR } from '@/i18n/pt-BR';

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
    onMutate: async (amountBrl) => {
      await queryClient.cancelQueries({ queryKey: dashboardQueryKeys.dashboard() });
      const snapshot = queryClient.getQueryData<IDashboardDomainDTO>(
        dashboardQueryKeys.dashboard(),
      );
      const price = currentPrice;
      if (snapshot && price) {
        const btcGain = (Number.parseFloat(amountBrl) / Number.parseFloat(price)).toFixed(8);
        queryClient.setQueryData(dashboardQueryKeys.dashboard(), {
          ...snapshot,
          brlBalance: (Number.parseFloat(snapshot.brlBalance) - Number.parseFloat(amountBrl)).toFixed(
            2,
          ),
          btcBalance: (Number.parseFloat(snapshot.btcBalance) + Number.parseFloat(btcGain)).toFixed(8),
        });
      }
      return { snapshot };
    },
    onError: (_, __, ctx) => {
      if (ctx?.snapshot) queryClient.setQueryData(dashboardQueryKeys.dashboard(), ctx.snapshot);
      toast.error(PT_BR.trade.error.generic);
    },
    onSuccess: () => {
      toast.success(PT_BR.trade.success.buy);
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: ['history'] });
      form.reset();
    },
  });

  const sellMutation = useMutation({
    mutationFn: (amountBtc: string) => tradeService.sell({ amountBtc }),
    onMutate: async (amountBtcRaw) => {
      await queryClient.cancelQueries({ queryKey: dashboardQueryKeys.dashboard() });
      const snapshot = queryClient.getQueryData<IDashboardDomainDTO>(
        dashboardQueryKeys.dashboard(),
      );
      const price = currentPrice;
      if (snapshot && price) {
        const brlGain = (Number.parseFloat(amountBtcRaw) * Number.parseFloat(price)).toFixed(2);
        queryClient.setQueryData(dashboardQueryKeys.dashboard(), {
          ...snapshot,
          btcBalance: (Number.parseFloat(snapshot.btcBalance) - Number.parseFloat(amountBtcRaw)).toFixed(
            8,
          ),
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
