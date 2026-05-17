import React from 'react';
import { View } from 'react-native';

import type { ICardHeaderViewProps } from './card-header.model';

function CardHeaderView({ children, className }: ICardHeaderViewProps) {
  return <View className={className}>{children}</View>;
}

export { CardHeaderView };
