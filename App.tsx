import './global.css'; // NativeWind CSS stylesheet must be loaded first
import 'react-native-gesture-handler'; // Required gesture handling bootstrap

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  NotoSansDevanagari_400Regular,
  NotoSansDevanagari_700Bold,
} from '@expo-google-fonts/noto-sans-devanagari';

import { AppNavigator } from './navigation/AppNavigator';
import { MiniPlayer } from './components/MiniPlayer';
import { dbService } from './services/db/dbService';
import { usePlayerStore } from './store/playerStore';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const initAudioService = usePlayerStore(state => state.initAudioService);
  const { colors, isDark } = useTheme();

  // Load typography fonts
  const [fontsLoaded] = useFonts({
    Inter: Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    NotoSansDevanagari: NotoSansDevanagari_400Regular,
    'NotoSansDevanagari-Bold': NotoSansDevanagari_700Bold,
  });

  // Bootstrap app databases & services
  useEffect(() => {
    async function bootstrap() {
      try {
        await dbService.initialize();
        setDbInitialized(true);
        await initAudioService();
      } catch (e) {
        console.error('Failed to bootstrap app services', e);
        setDbInitialized(true); // Fallback to let UI render anyway
      }
    }
    bootstrap();
  }, []);

  // Show a peaceful loading screen until fonts and database are ready
  if (!fontsLoaded || !dbInitialized) {
    return (
      <View
        style={{ backgroundColor: isDark ? '#121212' : '#FFF8F0' }}
        className="flex-1 items-center justify-center"
      >
        <ActivityIndicator size="large" color="#FF9933" />
      </View>
    );
  }

  // Setup navigation themes
  const navigationTheme: any = {
    dark: isDark,
    colors: {
      primary: '#FF9933',
      background: isDark ? '#121212' : '#FFF8F0',
      card: isDark ? '#1E1E1E' : '#FFFFFF',
      text: isDark ? '#FFFFFF' : '#222222',
      border: isDark ? '#2D2D2D' : '#E5E7EB',
      notification: '#FFB74D',
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: 'normal' },
      medium: { fontFamily: 'System', fontWeight: '500' },
      bold: { fontFamily: 'System', fontWeight: 'bold' },
      heavy: { fontFamily: 'System', fontWeight: '900' },
    },
  };

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <PaperProvider>
          <NavigationContainer theme={navigationTheme}>
            <View className="flex-1 relative">
              <AppNavigator />
              {/* Floating MiniPlayer docks persistently across the active tab page */}
              <MiniPlayer />
            </View>
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
