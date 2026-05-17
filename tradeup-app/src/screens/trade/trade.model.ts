type ITradeTab = 'buy' | 'sell';

interface ITradeViewProps {
  activeTab: ITradeTab;
  onSelectBuy: () => void;
  onSelectSell: () => void;
}

export type { ITradeTab, ITradeViewProps };
