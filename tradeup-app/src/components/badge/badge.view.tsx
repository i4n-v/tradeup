import React from 'react';
import { Text, View } from 'react-native';

import type { IBadgeViewProps } from './badge.model';

function BadgeView({ label, containerClass, dotClass, textClass }: IBadgeViewProps) {
  return (
    <View className={containerClass} accessibilityLabel={label}>
      <View className={dotClass} />
      <Text className={textClass}>{label}</Text>
    </View>
  );
}

export { BadgeView };
