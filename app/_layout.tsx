import { Stack } from 'expo-router/stack';
import '../global.css';
import { useStore } from '@/store/useStore';
import GetStartedPage from '@/components/GetStartedPage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HoldMenuProvider } from 'react-native-hold-menu';
import { themes } from '@/types/theme';
import { useState } from 'react';
import SecurityScreen from '@/components/SecurityScreen';

export default function Layout() {
  const { balance,theme } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Show GetStartedPage if balance is not initialized
  if (!balance.isInitialized) {
    return <GetStartedPage />;
  }

  if (!isAuthenticated) {
    return <SecurityScreen onAuthenticate={setIsAuthenticated} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HoldMenuProvider theme={theme} safeAreaInsets={{ top: 0, right: 0, bottom: 0, left: 0 }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      </HoldMenuProvider>
    </GestureHandlerRootView>
  );
}
