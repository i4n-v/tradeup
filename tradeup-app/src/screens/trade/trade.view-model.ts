import { useEffect, useState } from 'react';
import { useRoute, type RouteProp } from '@react-navigation/native';

import type { IAuthTabParamList } from '@/routes/navigation.types';

import type { ITradeTab, ITradeViewProps } from './trade.model';

function initialTabFromParams(params: { initialTab?: ITradeTab } | undefined): ITradeTab {
  const t = params?.initialTab;
  if (t === 'buy' || t === 'sell' || t === 'convert') return t;
  return 'buy';
}

function useTradeViewModel(): ITradeViewProps {
  const route = useRoute<RouteProp<IAuthTabParamList, 'Trade'>>();
  const paramTab = route.params?.initialTab;

  const [activeTab, setActiveTab] = useState<ITradeTab>(() => initialTabFromParams(route.params));

  useEffect(() => {
    if (paramTab === 'buy' || paramTab === 'sell' || paramTab === 'convert') {
      setActiveTab(paramTab);
    }
  }, [paramTab]);

  return {
    activeTab,
    onSelectTab: setActiveTab,
  };
}

export { useTradeViewModel };
