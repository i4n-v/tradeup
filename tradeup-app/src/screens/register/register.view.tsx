import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@react-native-vector-icons/feather';

import { Button } from '@/components/button/button.component';
import { TextField } from '@/components/text-field/text-field.component';
import { PT_BR } from '@/i18n/pt-BR';

import type { IRegisterViewProps } from './register.model';

function RegisterView({ form, onSubmit, isPending, onGoToLogin }: IRegisterViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="flex-1 px-4 pt-6">
          <View className="gap-6 py-6">
            <View>
              <Text className="text-2xl font-primary-semibold text-gray-900">{PT_BR.auth.register}</Text>
              <Text className="font-secondary text-gray-500 text-sm mt-1">Crie sua conta gratuita</Text>
            </View>

            <View className="gap-4">
              <TextField
                name="name"
                control={form.control}
                label={PT_BR.auth.name}
                autoCapitalize="words"
              />
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
              <TextField
                name="password_confirmation"
                control={form.control}
                label={PT_BR.auth.confirmPassword}
                secureTextEntry
                leftAdornment={<Feather name="lock" size={22} color="#6B7280" />}
              />
            </View>

            <Button.Root
              onPress={onSubmit}
              loading={isPending}
              disabled={isPending}
              accessibilityLabel={PT_BR.auth.register}
            >
              <Button.Text>{PT_BR.auth.register}</Button.Text>
            </Button.Root>

            <Button.Root
              variant="ghost"
              onPress={onGoToLogin}
              accessibilityLabel={PT_BR.auth.haveAccount}
            >
              <Button.Text variant="ghost">{PT_BR.auth.haveAccount}</Button.Text>
            </Button.Root>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export { RegisterView };
