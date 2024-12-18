import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import "../global.css";
import { Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar, TouchableOpacity } from 'react-native';
import { useStore } from "@/store/useStore";
import GetStartedPage from '@/components/GetStartedPage';
import { HoldMenuProvider } from 'react-native-hold-menu';
import SecurityScreen from '../components/SecurityScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes } from '@/types/theme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

if (!AsyncStorage) {
  console.warn('AsyncStorage is not available');
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const { showBalance, toggleBalanceVisibility, balance, theme } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const themeColors = themes[theme];

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Show GetStartedPage if balance is not initialized
  if (!balance.isInitialized) {
    return <GetStartedPage />;
  }

  if (!isAuthenticated) {
    return <SecurityScreen onAuthenticate={setIsAuthenticated} />;
  }

  const HeaderRight = () => (
    <TouchableOpacity
      onPress={toggleBalanceVisibility}
      className="p-2 mr-4"
    >
      <FontAwesome
        name={showBalance ? "eye" : "eye-slash"}
        size={20}
        color="#64748b"
      />
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HoldMenuProvider theme={theme} safeAreaInsets={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <StatusBar barStyle={themeColors.statusBar} />
        <Tabs
          screenOptions={{
            headerShown: true,
            headerTitleAlign: 'center',
            tabBarActiveTintColor: themeColors.text.accent,
            tabBarInactiveTintColor: themeColors.text.secondary,
            headerStyle: {
              backgroundColor: themeColors.card,
            },
            headerTintColor: themeColors.text.primary,
            tabBarStyle: {
              backgroundColor: themeColors.card,
              borderTopColor: themeColors.border,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Dashboard",
              tabBarIcon: ({ color }) => (
                <FontAwesome name="dashboard" size={22} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="transactions"
            options={{
              title: "Transactions",
              tabBarIcon: ({ color }) => (
                <FontAwesome name="money" size={22} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="analytics"
            options={{
              title: "Analytics",
              tabBarIcon: ({ color }) => (
                <FontAwesome name="pie-chart" size={22} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: "Settings",
              tabBarIcon: ({ color }) => (
                <FontAwesome name="cog" size={22} color={color} />
              ),
            }}
          />
        </Tabs>
      </HoldMenuProvider>
    </GestureHandlerRootView>
  );
}
