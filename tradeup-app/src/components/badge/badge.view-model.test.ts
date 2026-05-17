import { renderHook } from '@testing-library/react-native';

import { useBadgeViewModel } from './badge.view-model';

describe('useBadgeViewModel', () => {
  it('should return the BUY label', () => {
    const { result } = renderHook(() => useBadgeViewModel({ type: 'BUY' }));

    expect(result.current.label).toBe('Compra');
  });

  it('should return the SELL label', () => {
    const { result } = renderHook(() => useBadgeViewModel({ type: 'SELL' }));

    expect(result.current.label).toBe('Venda');
  });

  it('should merge extra className into containerClass', () => {
    const { result } = renderHook(() =>
      useBadgeViewModel({ type: 'BUY', className: 'mt-2' }),
    );

    expect(result.current.containerClass).toContain('mt-2');
  });
});
