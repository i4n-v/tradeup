import React from 'react';
import { Text } from 'react-native';

import type { IButtonTextViewProps } from './button-text.model';

function ButtonTextView({ children, className }: IButtonTextViewProps) {
  return <Text className={className}>{children}</Text>;
}

export { ButtonTextView };
