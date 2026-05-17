import { renderHook, act } from '@testing-library/react-native';

import { useTextFieldViewModel } from './text-field.view-model';

describe('useTextFieldViewModel', () => {
  it('should start unfocused', () => {
    const { result } = renderHook(() => useTextFieldViewModel());

    expect(result.current.focused).toBe(false);
  });

  it('should set focused to true when onFocusChange(true) is called', () => {
    const { result } = renderHook(() => useTextFieldViewModel());

    act(() => {
      result.current.onFocusChange(true);
    });

    expect(result.current.focused).toBe(true);
  });

  it('should set focused to false when onFocusChange(false) is called after focusing', () => {
    const { result } = renderHook(() => useTextFieldViewModel());

    act(() => {
      result.current.onFocusChange(true);
      result.current.onFocusChange(false);
    });

    expect(result.current.focused).toBe(false);
  });
});
