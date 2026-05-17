import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Feather } from '@react-native-vector-icons/feather';

import { Button } from '@/components/button/button.component';
import { TextField } from '@/components/text-field/text-field.component';
import { PT_BR } from '@/i18n/pt-BR';

import type { ILoginViewProps } from './login.model';

function LoginView({ form, onSubmit, isPending, onGoToRegister }: ILoginViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="flex-1 px-4 pt-6">
          <View className="flex-1 justify-center gap-6 py-10">
            <View className="items-center gap-2">
              <View className="bg-yellow-400 rounded-2xl p-4 mb-2">
                <Text className="text-gray-900 text-3xl font-primary-semibold">TU</Text>
              </View>
              <Text className="text-2xl font-primary-semibold text-gray-900">TradeUp</Text>
              <Text className="font-secondary text-gray-500 text-sm">
                A plataforma de trading simplificada
              </Text>
            </View>

            <View className="gap-4">
              <TextField
                name="email"
                control={form.control}
                label={PT_BR.auth.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                leftAdornment={<Feather name="user" size={22} color="#6B7280" />}
              />
              <TextField
                name="password"
                control={form.control}
                label={PT_BR.auth.password}
                secureTextEntry
                leftAdornment={<Feather name="lock" size={22} color="#6B7280" />}
              />
            </View>

            <Button.Root
              onPress={onSubmit}
              loading={isPending}
              disabled={isPending}
              accessibilityLabel={PT_BR.auth.login}
            >
              <Button.Text>{PT_BR.auth.login}</Button.Text>
            </Button.Root>

            <Button.Root
              variant="ghost"
              onPress={onGoToRegister}
              accessibilityLabel={PT_BR.auth.noAccount}
            >
              <Button.Text variant="ghost">{PT_BR.auth.noAccount}</Button.Text>
            </Button.Root>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export { LoginView };
