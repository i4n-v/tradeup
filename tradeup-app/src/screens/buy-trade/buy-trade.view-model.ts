import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Alert } from 'react-native';

import { Registry } from '@lib/registry/registry.lib';
import { toast } from '@/lib/toast/toast.lib';
import type { IDashboardDomainDTO } from '@/resources/services/dashboard/dtos/dashboard.domain.dto';
import type { IAuthTabParamList } from '@/routes/navigation.types';
import { PT_BR } from '@/i18n/pt-BR';

import { buySchema, type IBuyFormValues, type IBuyTradeViewProps } from './buy-trade.model';

function useBuyTradeViewModel(): IBuyTradeViewProps {
  const queryClient = useQueryClient();
  const navigation = useNavigation<BottomTabNavigationProp<IAuthTabParamList>>();
  const tradeService = Registry.getInstance().inject('tradeService');
  const dashboardQueryKeys = Registry.getInstance().inject('dashboardQueryKeys');

  const form = useForm<IBuyFormValues>({
    defaultValues: { amountBrl: '' },
    resolver: zodResolver(buySchema),
  });

  const currentPrice =
    (queryClient.getQueryData<IDashboardDomainDTO>(
      dashboardQueryKeys.dashboard(),
    ) as IDashboardDomainDTO | undefined)?.btcPriceBrl ?? null;

  const amountBrl = form.watch('amountBrl');
  const estimatedBtc =
    currentPrice && amountBrl
      ? (parseFloat(amountBrl) / parseFloat(currentPrice)).toFixed(8)
      : '0.00000000';

  const mutation = useMutation({
    mutationFn: (data: IBuyFormValues) => tradeService.buy({ amountBrl: data.amountBrl }),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: dashboardQueryKeys.dashboard() });
      const snapshot = queryClient.getQueryData<IDashboardDomainDTO>(
        dashboardQueryKeys.dashboard(),
      );
      if (snapshot && currentPrice) {
        const btcGain = (parseFloat(data.amountBrl) / parseFloat(currentPrice)).toFixed(8);
        queryClient.setQueryData(dashboardQueryKeys.dashboard(), {
          ...snapshot,
          brlBalance: (parseFloat(snapshot.brlBalance) - parseFloat(data.amountBrl)).toFixed(2),
          btcBalance: (parseFloat(snapshot.btcBalance) + parseFloat(btcGain)).toFixed(8),
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

  const onSubmit = form.handleSubmit((data) => {
    Alert.alert(
      PT_BR.trade.confirmBuyTitle,
      `Comprar ${estimatedBtc} BTC por R$ ${data.amountBrl}?`,
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
    estimatedBtc,
    onSellPress: () => navigation.navigate('BuyTrade'),
  };
}

export { useBuyTradeViewModel };
