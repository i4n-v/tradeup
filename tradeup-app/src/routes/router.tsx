import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { Registry } from '@lib/registry/registry.lib';
import { useSessionStore } from '@/stores/session.store';
import { AuthRoute } from './auth/auth.route';
import { UnauthRoute } from './unauth/unauth.route';

function Router() {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const setSession = useSessionStore((s) => s.setSession);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await Registry.getInstance().inject('authSession').getToken();
        if (token) {
          setSession(token, { id: '', name: '', email: '', avatarUrl: null, createdAt: '' });
        }
      } finally {
        setIsHydrated(true);
      }
    })();
  // setSession from Zustand store is stable across renders
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isHydrated) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#eab308" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AuthRoute /> : <UnauthRoute />}
    </NavigationContainer>
  );
}

export { Router };
