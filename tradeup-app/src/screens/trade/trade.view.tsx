import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PT_BR } from '@/i18n/pt-BR';
import { SegmentedControl } from '@/components/segmented-control/segmented-control.component';

import { BuyTradeScreen } from '../buy-trade/buy-trade.component';
import { SellTradeScreen } from '../sell-trade/sell-trade.component';
import { ConvertTradeScreen } from '../convert-trade/convert-trade.component';

import type { ITradeTab, ITradeViewProps } from './trade.model';

const TRADE_TABS = [
  { key: 'buy' as ITradeTab, label: PT_BR.trade.tabBuy },
  { key: 'sell' as ITradeTab, label: PT_BR.trade.tabSell },
  { key: 'convert' as ITradeTab, label: PT_BR.trade.tabConvert },
];

function TradeView({ activeTab, onSelectTab }: ITradeViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <SegmentedControl
        items={TRADE_TABS}
        value={activeTab}
        onChange={(key) => onSelectTab(key as ITradeTab)}
        className="mx-3 mt-2 mb-1"
      />

      <View className="flex-1">
        {activeTab === 'buy' ? <BuyTradeScreen /> : null}
        {activeTab === 'sell' ? <SellTradeScreen /> : null}
        {activeTab === 'convert' ? <ConvertTradeScreen /> : null}
      </View>
    </SafeAreaView>
  );
}

export { TradeView };
