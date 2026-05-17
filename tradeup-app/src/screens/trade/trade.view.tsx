import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { cn } from '@/lib/utils/cn/cn.util';
import { PT_BR } from '@/i18n/pt-BR';

import { BuyTradeScreen } from '../buy-trade/buy-trade.component';
import { SellTradeScreen } from '../sell-trade/sell-trade.component';

import type { ITradeViewProps } from './trade.model';

function TradeView({ activeTab, onSelectBuy, onSelectSell }: ITradeViewProps) {
  return (
    <View className="flex-1 bg-base-50">
      <View className="flex-row bg-base-0 mx-4 mt-4 rounded-full p-1 border border-base-200">
        <Pressable
          className={cn(
            'flex-1 py-2 rounded-full items-center',
            activeTab === 'buy' ? 'bg-primary-400' : 'bg-transparent',
          )}
          onPress={onSelectBuy}
          accessibilityRole="button"
          accessibilityLabel={PT_BR.dashboard.buy}
          accessibilityState={{ selected: activeTab === 'buy' }}
        >
          <Text
            className={cn(
              'font-primary-semibold text-sm',
              activeTab === 'buy' ? 'text-base-900' : 'text-base-500',
            )}
          >
            {PT_BR.dashboard.buy}
          </Text>
        </Pressable>

        <Pressable
          className={cn(
            'flex-1 py-2 rounded-full items-center',
            activeTab === 'sell' ? 'bg-primary-400' : 'bg-transparent',
          )}
          onPress={onSelectSell}
          accessibilityRole="button"
          accessibilityLabel={PT_BR.dashboard.sell}
          accessibilityState={{ selected: activeTab === 'sell' }}
        >
          <Text
            className={cn(
              'font-primary-semibold text-sm',
              activeTab === 'sell' ? 'text-base-900' : 'text-base-500',
            )}
          >
            {PT_BR.dashboard.sell}
          </Text>
        </Pressable>
      </View>

      {activeTab === 'buy' ? <BuyTradeScreen /> : <SellTradeScreen />}
    </View>
  );
}

export { TradeView };
