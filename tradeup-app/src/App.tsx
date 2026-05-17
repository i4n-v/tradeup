import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { queryClient } from '@/configs/di-container.config';
import { Router } from '@/routes/router';

import './global.css';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <Router />
        <Toast />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
