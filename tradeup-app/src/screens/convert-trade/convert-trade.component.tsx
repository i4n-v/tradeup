import React from 'react';

import { useConvertTradeViewModel } from './convert-trade.view-model';
import { ConvertTradeView } from './convert-trade.view';

function ConvertTradeScreen() {
  const logic = useConvertTradeViewModel();
  return <ConvertTradeView {...logic} />;
}

export { ConvertTradeScreen };
