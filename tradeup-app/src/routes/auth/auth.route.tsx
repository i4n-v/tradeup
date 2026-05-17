/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@react-native-vector-icons/feather';

import type { IAuthTabParamList } from '../navigation.types';
import { DashboardScreen } from '@/screens/dashboard/dashboard.component';
import { TradeScreen } from '@/screens/trade/trade.component';
import { HistoryScreen } from '@/screens/history/history.component';
import { ProfileScreen } from '@/screens/profile/profile.component';
import { PT_BR } from '@/i18n/pt-BR';

import { ProfileTabIcon } from '@/components/profile-tab-icon/profile-tab-icon.component';

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
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: PT_BR.dashboard.title,
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Trade"
        component={TradeScreen}
        options={{
          title: PT_BR.trade.hubTabBar,
          tabBarIcon: ({ color, size }) => (
            <Feather name="trending-up" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: PT_BR.history.title,
          tabBarIcon: ({ color, size }) => (
            <Feather name="list" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: PT_BR.profile.title,
          tabBarIcon: ({ color, size }) => (
            <ProfileTabIcon color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export { AuthRoute };
