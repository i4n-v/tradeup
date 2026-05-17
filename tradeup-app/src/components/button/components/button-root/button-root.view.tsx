import React from 'react';
import { ActivityIndicator, Pressable } from 'react-native';

import type { IButtonRootViewProps } from './button-root.model';

function ButtonRootView({
  onPress,
  children,
  loading,
  isDisabled,
  indicatorColor,
  className,
  accessibilityLabel,
}: IButtonRootViewProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={className}
    >
      {loading ? (
        <ActivityIndicator size="small" color={indicatorColor} />
      ) : (
        children
      )}
    </Pressable>
  );
}

export { ButtonRootView };
