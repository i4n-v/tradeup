import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button/button.component';
import { PT_BR } from '@/i18n/pt-BR';

import type { IDashboardViewProps } from './dashboard.model';

function formatBrl(value: string) {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function DashboardView({
  brlBalance,
  btcBalance,
  btcPriceBrl,
  isLoading,
  isError,
  isRefetching,
  refetch,
  onBuyPress,
  onSellPress,
}: IDashboardViewProps) {
  const [manualRefresh, setManualRefresh] = useState(false);
  const refreshing = manualRefresh || isRefetching;

  const onRefresh = useCallback(() => {
    setManualRefresh(true);
    void Promise.resolve(refetch()).finally(() => setManualRefresh(false));
  }, [refetch]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
        <View className="flex-1 px-4 pt-6">
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#eab308" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
        <View className="flex-1 px-4 pt-6">
          <View className="flex-1 items-center justify-center gap-4">
            <Text className="font-secondary text-gray-500">{PT_BR.common.error}</Text>
            <Button.Root onPress={refetch} variant="secondary" accessibilityLabel={PT_BR.common.retry}>
              <Button.Text variant="secondary">{PT_BR.common.retry}</Button.Text>
            </Button.Root>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#eab308" />
        }
      >
        <View className="gap-4 p-4">
          <View
            className="bg-yellow-400 rounded-3xl p-6 gap-2"
            accessibilityLabel="Cartão de saldo"
          >
            <Text className="text-gray-700 text-sm font-primary-medium">{PT_BR.dashboard.title}</Text>
            <Text className="font-secondary-bold text-gray-900 text-3xl">{formatBrl(brlBalance)}</Text>
            <Text className="font-secondary text-gray-700 text-sm">₿ {btcBalance} BTC</Text>
          </View>

          <View className="bg-white rounded-2xl shadow-sm p-4 gap-1">
            <Text className="text-gray-500 text-sm font-primary-medium">{PT_BR.dashboard.btcPrice}</Text>
            {btcPriceBrl ? (
              <Text className="font-secondary-semibold text-gray-900 text-xl">{formatBrl(btcPriceBrl)}</Text>
            ) : (
              <Text className="font-secondary text-gray-400 text-base">{PT_BR.dashboard.priceUnavailable}</Text>
            )}
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button.Root onPress={onBuyPress} accessibilityLabel={PT_BR.dashboard.buy}>
                <Button.Text>{PT_BR.dashboard.buy}</Button.Text>
              </Button.Root>
            </View>
            <View className="flex-1">
              <Button.Root
                onPress={onSellPress}
                variant="secondary"
                accessibilityLabel={PT_BR.dashboard.sell}
              >
                <Button.Text variant="secondary">{PT_BR.dashboard.sell}</Button.Text>
              </Button.Root>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export { DashboardView };
