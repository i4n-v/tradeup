import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import type { IAuthTabParamList } from '../navigation.types';
import { DashboardScreen } from '@/screens/dashboard/dashboard.component';
import { BuyTradeScreen } from '@/screens/buy-trade/buy-trade.component';
import { HistoryScreen } from '@/screens/history/history.component';
import { ProfileScreen } from '@/screens/profile/profile.component';
import { PT_BR } from '@/i18n/pt-BR';

const Tab = createBottomTabNavigator<IAuthTabParamList>();

function AuthRoute() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#eab308',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#f3f4f6' },
        tabBarLabelStyle: { fontSize: 11, fontFamily: 'Poppins-Medium' },
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: PT_BR.dashboard.title }} />
      <Tab.Screen name="BuyTrade" component={BuyTradeScreen} options={{ title: PT_BR.trade.buyTitle }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: PT_BR.history.title }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: PT_BR.profile.title }} />
    </Tab.Navigator>
  );
}

export { AuthRoute };
