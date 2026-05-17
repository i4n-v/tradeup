import { useState } from 'react';

import type { ITradeViewProps } from './trade.model';

function useTradeViewModel(): ITradeViewProps {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');

  return {
    activeTab,
    onSelectBuy: () => setActiveTab('buy'),
    onSelectSell: () => setActiveTab('sell'),
  };
}

export { useTradeViewModel };
