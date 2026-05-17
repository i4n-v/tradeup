import { renderHook, act } from '@testing-library/react-native';

import { useTradeViewModel } from './trade.view-model';

describe('useTradeViewModel', () => {
  it('should start with buy tab active', () => {
    const { result } = renderHook(() => useTradeViewModel());

    expect(result.current.activeTab).toBe('buy');
  });

  it('should switch to sell tab when onSelectSell is called', () => {
    const { result } = renderHook(() => useTradeViewModel());

    act(() => {
      result.current.onSelectSell();
    });

    expect(result.current.activeTab).toBe('sell');
  });

  it('should switch back to buy tab when onSelectBuy is called', () => {
    const { result } = renderHook(() => useTradeViewModel());

    act(() => {
      result.current.onSelectSell();
      result.current.onSelectBuy();
    });

    expect(result.current.activeTab).toBe('buy');
  });
});
