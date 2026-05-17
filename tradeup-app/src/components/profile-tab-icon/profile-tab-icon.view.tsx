import React from 'react';
import { Image } from 'react-native';
import { Feather } from '@react-native-vector-icons/feather';

import type { IProfileTabIconViewProps } from './profile-tab-icon.model';

function ProfileTabIconView({ color, size, avatarUrl }: IProfileTabIconViewProps) {
  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        accessibilityLabel="Foto do perfil"
        accessibilityRole="image"
      />
    );
  }

  return (
    <Feather
      name="user"
      size={size}
      color={color}
      accessibilityLabel="Perfil"
    />
  );
}

export { ProfileTabIconView };
