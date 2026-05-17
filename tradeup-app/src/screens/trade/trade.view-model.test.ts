import { renderHook, act } from '@testing-library/react-native';

import { useTradeViewModel } from './trade.view-model';

const mockUseRoute = jest.fn(() => ({ params: {} as Record<string, unknown> }));

jest.mock('@react-navigation/native', () => ({
  useRoute: () => mockUseRoute(),
}));

describe('useTradeViewModel', () => {
  beforeEach(() => {
    mockUseRoute.mockReturnValue({ params: {} });
  });

  it('should start with buy tab active', () => {
    const { result } = renderHook(() => useTradeViewModel());

    expect(result.current.activeTab).toBe('buy');
  });

  it('should switch to sell tab when onSelectTab is called with sell', () => {
    const { result } = renderHook(() => useTradeViewModel());

    act(() => {
      result.current.onSelectTab('sell');
    });

    expect(result.current.activeTab).toBe('sell');
  });

  it('should set tab from route params', () => {
    mockUseRoute.mockReturnValue({ params: { initialTab: 'convert' } });

    const { result } = renderHook(() => useTradeViewModel());

    expect(result.current.activeTab).toBe('convert');
  });

  it('should switch back to buy tab when onSelectTab is called with buy', () => {
    const { result } = renderHook(() => useTradeViewModel());

    act(() => {
      result.current.onSelectTab('sell');
      result.current.onSelectTab('buy');
    });

    expect(result.current.activeTab).toBe('buy');
  });
});
