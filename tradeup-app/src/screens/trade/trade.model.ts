type ITradeTab = 'buy' | 'sell' | 'convert';

interface ITradeViewProps {
  activeTab: ITradeTab;
  onSelectTab: (tab: ITradeTab) => void;
}

export type { ITradeTab, ITradeViewProps };
