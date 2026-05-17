import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { IUnauthStackParamList } from '../navigation.types';
import { LoginScreen } from '@/screens/login/login.component';
import { RegisterScreen } from '@/screens/register/register.component';

const Stack = createNativeStackNavigator<IUnauthStackParamList>();

function UnauthRoute() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export { UnauthRoute };
