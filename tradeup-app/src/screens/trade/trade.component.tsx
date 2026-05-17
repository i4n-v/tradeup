import React from 'react';

import { useTradeViewModel } from './trade.view-model';
import { TradeView } from './trade.view';

function TradeScreen() {
  const logic = useTradeViewModel();
  return <TradeView {...logic} />;
}

export { TradeScreen };
