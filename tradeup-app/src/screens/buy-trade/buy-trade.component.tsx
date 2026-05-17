import React from 'react';

import { useBuyTradeViewModel } from './buy-trade.view-model';
import { BuyTradeView } from './buy-trade.view';

function BuyTradeScreen() {
  const logic = useBuyTradeViewModel();
  return <BuyTradeView {...logic} />;
}

export { BuyTradeScreen };
