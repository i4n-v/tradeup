import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  const dashboardQueryKeys = Registry.getInstance().inject('dashboardQueryKeys');

  const form = useForm<ISellFormValues>({
    defaultValues: { amountBtc: '' },
    resolver: zodResolver(sellSchema),
  });

  const currentPrice =
    (queryClient.getQueryData<IDashboardDomainDTO>(
      dashboardQueryKeys.dashboard(),
    ) as IDashboardDomainDTO | undefined)?.btcPriceBrl ?? null;

  const amountBtc = form.watch('amountBtc');
  const estimatedBrl =
    currentPrice && amountBtc
      ? (parseFloat(amountBtc) * parseFloat(currentPrice)).toFixed(2)
      : '0.00';

  const mutation = useMutation({
    mutationFn: (data: ISellFormValues) => tradeService.sell({ amountBtc: data.amountBtc }),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: dashboardQueryKeys.dashboard() });
      const snapshot = queryClient.getQueryData<IDashboardDomainDTO>(
        dashboardQueryKeys.dashboard(),
      );
      if (snapshot && currentPrice) {
        const brlGain = (parseFloat(data.amountBtc) * parseFloat(currentPrice)).toFixed(2);
        queryClient.setQueryData(dashboardQueryKeys.dashboard(), {
          ...snapshot,
          btcBalance: (parseFloat(snapshot.btcBalance) - parseFloat(data.amountBtc)).toFixed(8),
          brlBalance: (parseFloat(snapshot.brlBalance) + parseFloat(brlGain)).toFixed(2),
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
    Alert.alert(
      PT_BR.trade.confirmSellTitle,
      `Vender ${data.amountBtc} BTC por ~R$ ${estimatedBrl}?`,
      [
        { text: PT_BR.trade.cancel, style: 'cancel' },
        { text: PT_BR.trade.confirm, onPress: () => mutation.mutate(data) },
      ],
    );
  });

  return {
    form,
    onSubmit,
    isPending: mutation.isPending,
    btcPriceBrl: currentPrice,
    estimatedBrl,
  };
}

export { useSellTradeViewModel };
