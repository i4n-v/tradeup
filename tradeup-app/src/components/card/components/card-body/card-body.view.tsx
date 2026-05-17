import React from 'react';
import { View } from 'react-native';

import type { ICardBodyViewProps } from './card-body.model';

function CardBodyView({ children, className }: ICardBodyViewProps) {
  return <View className={className}>{children}</View>;
}

export { CardBodyView };
