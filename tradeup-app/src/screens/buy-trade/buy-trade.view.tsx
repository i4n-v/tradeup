import React from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/button/button.component';
import { TextField } from '@/components/text-field/text-field.component';
import { PT_BR } from '@/i18n/pt-BR';
import { brlMask } from '@/utils/money/money.util';

import type { IBuyTradeViewProps } from './buy-trade.model';

function BuyTradeView({
  form,
  onSubmit,
  isPending,
  btcPriceBrl,
  estimatedBtc,
  onRefresh,
  isRefreshing,
}: IBuyTradeViewProps) {
  return (
    <ScrollView
      className="flex-1 bg-white"
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#eab308" />
      }
    >
      <View className="flex-1 px-4 pt-2 pb-8">
        <Text className="text-2xl font-primary-semibold text-gray-900 mb-6">{PT_BR.trade.buyTitle}</Text>
        <View className="gap-6">
          {btcPriceBrl ? (
            <View className="bg-yellow-50 rounded-2xl p-4">
              <Text className="text-gray-500 text-sm font-primary-medium">{PT_BR.dashboard.btcPrice}</Text>
              <Text className="font-secondary-semibold text-gray-900 text-xl">
                R${' '}
                {parseFloat(btcPriceBrl).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          ) : null}

          <TextField
            name="amountBrl"
            control={form.control}
            label={PT_BR.trade.brlAmount}
            placeholder={PT_BR.trade.placeholderBrl}
            keyboardType="decimal-pad"
            mask={brlMask}
          />

          <View className="bg-gray-50 rounded-xl p-4 gap-1">
            <Text className="text-gray-500 text-sm font-primary-medium">{PT_BR.trade.estimatedBtc}</Text>
            <Text className="font-secondary-semibold text-gray-900 text-lg">₿ {estimatedBtc}</Text>
          </View>

          <Button.Root
            onPress={onSubmit}
            loading={isPending}
            disabled={isPending}
            accessibilityLabel={PT_BR.trade.buyTitle}
          >
            <Button.Text>{PT_BR.trade.buyTitle}</Button.Text>
          </Button.Root>
        </View>
      </View>
    </ScrollView>
  );
}

export { BuyTradeView };
