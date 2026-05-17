import React from 'react';

import { useSellTradeViewModel } from './sell-trade.view-model';
import { SellTradeView } from './sell-trade.view';

function SellTradeScreen() {
  const logic = useSellTradeViewModel();
  return <SellTradeView {...logic} />;
}

export { SellTradeScreen };
