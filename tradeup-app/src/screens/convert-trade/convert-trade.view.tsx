import React from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { cn } from '@/utils/cn/cn.util';
import { Button } from '@/components/button/button.component';
import { TextField } from '@/components/text-field/text-field.component';
import { PT_BR } from '@/i18n/pt-BR';
import { brlMask, btcMask } from '@/utils/money/money.util';

import type { IConvertTradeViewProps } from './convert-trade.model';

function ConvertTradeView({
  form,
  direction,
  onDirectionChange,
  onSubmit,
  isPending,
  btcPriceBrl,
  estimatedCounter,
  counterLabel,
  amountLabel,
  moneyFormat,
  submitLabel,
  variant,
  onRefresh,
  isRefreshing,
}: IConvertTradeViewProps) {
  return (
    <ScrollView
      className="flex-1 bg-white"
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#eab308" />
      }
    >
      <View className="flex-1 px-4 pt-2 pb-8">
        <Text className="text-2xl font-primary-semibold text-gray-900 mb-4">
          {PT_BR.trade.convertTitle}
        </Text>

        <View className="flex-row gap-2 mb-6">
          <Pressable
            className={cn(
              'flex-1 py-3 px-2 rounded-2xl border items-center',
              direction === 'brl-to-btc' ? 'bg-yellow-400 border-yellow-500' : 'bg-gray-50 border-gray-200',
            )}
            onPress={() => onDirectionChange('brl-to-btc')}
            accessibilityRole="button"
            accessibilityState={{ selected: direction === 'brl-to-btc' }}
          >
            <Text
              className={cn(
                'text-xs text-center font-primary-semibold',
                direction === 'brl-to-btc' ? 'text-gray-900' : 'text-gray-500',
              )}
            >
              {PT_BR.trade.convertBrlToBtc}
            </Text>
          </Pressable>
          <Pressable
            className={cn(
              'flex-1 py-3 px-2 rounded-2xl border items-center',
              direction === 'btc-to-brl' ? 'bg-orange-100 border-orange-200' : 'bg-gray-50 border-gray-200',
            )}
            onPress={() => onDirectionChange('btc-to-brl')}
            accessibilityRole="button"
            accessibilityState={{ selected: direction === 'btc-to-brl' }}
          >
            <Text
              className={cn(
                'text-xs text-center font-primary-semibold',
                direction === 'btc-to-brl' ? 'text-gray-900' : 'text-gray-500',
              )}
            >
              {PT_BR.trade.convertBtcToBrl}
            </Text>
          </Pressable>
        </View>

        {btcPriceBrl && (
          <View
            className={cn(
              'rounded-2xl p-4 mb-6',
              direction === 'brl-to-btc' ? 'bg-yellow-50' : 'bg-orange-50',
            )}
          >
            <Text className="text-gray-500 text-sm font-primary-medium">{PT_BR.dashboard.btcPrice}</Text>
            <Text className="font-secondary-semibold text-gray-900 text-xl">
              R${' '}
              {Number.parseFloat(btcPriceBrl).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        )}

        <View className="gap-6">
          <TextField
            name="amount"
            control={form.control}
            label={amountLabel}
            placeholder={moneyFormat === 'brl' ? PT_BR.trade.placeholderBrl : PT_BR.trade.placeholderBtc}
            keyboardType="decimal-pad"
            mask={moneyFormat === 'brl' ? brlMask : btcMask}
          />

          <View className="bg-gray-50 rounded-xl p-4 gap-1">
            <Text className="text-gray-500 text-sm font-primary-medium">{counterLabel}</Text>
            <Text className="font-secondary-semibold text-gray-900 text-lg">
              {direction === 'brl-to-btc' ? `₿ ${estimatedCounter}` : `R$ ${estimatedCounter}`}
            </Text>
          </View>

          <Button.Root
            onPress={onSubmit}
            loading={isPending}
            disabled={isPending}
            variant={variant === 'danger' ? 'danger' : 'primary'}
            accessibilityLabel={submitLabel}
          >
            <Button.Text variant={variant === 'danger' ? 'danger' : undefined}>{submitLabel}</Button.Text>
          </Button.Root>
        </View>
      </View>
    </ScrollView>
  );
}

export { ConvertTradeView };
