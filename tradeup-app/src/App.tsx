import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '@configs/di-container.config';
import { Registry } from '@lib/registry/registry.lib';
import './global.css';
import { API_BASE_URL } from '@env';


function App() {
  const queryClient = Registry.getInstance().inject('queryClient');

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <View className="flex-1 bg-base-900 pt-10">
          <Text className="text-base-0 text-2xl font-bold">{API_BASE_URL}</Text>
        </View>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}



export default App;
