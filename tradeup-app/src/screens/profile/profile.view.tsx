import React from 'react';
import { ActivityIndicator, Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button/button.component';
import { TextField } from '@/components/text-field/text-field.component';
import { PT_BR } from '@/i18n/pt-BR';

import type { IProfileViewProps } from './profile.model';

function ProfileView({
  form,
  onSave,
  onChangeAvatar,
  onLogout,
  isSaving,
  email,
  avatarUrl,
  name,
  isLoading,
}: IProfileViewProps) {
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 px-4 pt-6">
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#eab308" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const initials = name
    ? name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="flex-1 px-4 pt-6">
          <Text className="text-2xl font-primary-semibold text-gray-900 mb-6">{PT_BR.profile.title}</Text>
          <View className="gap-6">
            <View className="items-center gap-3">
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  className="w-24 h-24 rounded-full"
                  accessibilityLabel="Foto de perfil"
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-yellow-400 items-center justify-center">
                  <Text className="font-primary-semibold text-gray-900 text-2xl">{initials}</Text>
                </View>
              )}
              <Button.Root
                variant="ghost"
                onPress={onChangeAvatar}
                size="sm"
                accessibilityLabel={PT_BR.profile.changeAvatar}
              >
                <Button.Text variant="ghost" size="sm">
                  {PT_BR.profile.changeAvatar}
                </Button.Text>
              </Button.Root>
            </View>

            <TextField
              name="name"
              control={form.control}
              label={PT_BR.profile.name}
              autoCapitalize="words"
            />

            <View className="gap-1">
              <Text className="text-sm font-primary-medium text-gray-400">{PT_BR.profile.email}</Text>
              <Text className="font-secondary text-base text-gray-400 border border-gray-100 rounded-xl px-4 py-3 bg-gray-50">
                {email}
              </Text>
            </View>

            <Button.Root
              onPress={onSave}
              loading={isSaving}
              disabled={isSaving}
              accessibilityLabel={PT_BR.profile.save}
            >
              <Button.Text>{PT_BR.profile.save}</Button.Text>
            </Button.Root>

            <Button.Root
              variant="danger"
              onPress={onLogout}
              accessibilityLabel={PT_BR.profile.logout}
            >
              <Button.Text variant="danger">{PT_BR.profile.logout}</Button.Text>
            </Button.Root>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export { ProfileView };
