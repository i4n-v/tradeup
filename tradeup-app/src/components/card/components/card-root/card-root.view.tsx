import React from 'react';
import { View } from 'react-native';

import type { ICardRootViewProps } from './card-root.model';

function CardRootView({ children, className }: ICardRootViewProps) {
  return <View className={className}>{children}</View>;
}

export { CardRootView };
