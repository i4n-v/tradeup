import React from 'react';
import { Pressable, Text, View } from 'react-native';

import type { ISegmentedControlViewProps } from './segmented-control.model';
import { labelVariants, segmentVariants } from './segmented-control.variants';

function SegmentedControlView({ items, value, onChange, containerClass }: ISegmentedControlViewProps) {
  return (
    <View className={containerClass}>
      {items.map((item) => {
        const isActive = item.key === value;
        return (
          <Pressable
            key={item.key}
            className={segmentVariants({ active: isActive })}
            onPress={() => onChange(item.key)}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: isActive }}
          >
            <Text className={labelVariants({ active: isActive })}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export { SegmentedControlView };
