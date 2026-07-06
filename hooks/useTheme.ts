import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';

export function useTheme() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const storedTheme = useSettingsStore(state => state.theme);
  const deviceColorScheme = useDeviceColorScheme();

  useEffect(() => {
    if (storedTheme === 'system') {
      setColorScheme(deviceColorScheme === 'dark' ? 'dark' : 'light');
    } else {
      setColorScheme(storedTheme);
    }
  }, [storedTheme, deviceColorScheme]);

  const isDark = colorScheme === 'dark';

  const colors = {
    primary: isDark ? '#FFB74D' : '#FF9933', // Soft saffron vs Sacred saffron
    background: isDark ? '#121212' : '#FFF8F0', // Cosmic night vs Serene sand
    surface: isDark ? '#1E1E1E' : '#FFFFFF', // Dark charcoal vs Pure white
    text: isDark ? '#FFFFFF' : '#222222', // Pure white vs Deep charcoal
    textMuted: isDark ? '#A0A0A0' : '#666666',
    accent: isDark ? '#F59E0B' : '#D97706', // Gold vs Amber
    border: isDark ? '#2D2D2D' : '#E5E7EB',
  };

  return {
    colorScheme,
    isDark,
    colors,
    setTheme: (theme: 'light' | 'dark' | 'system') => {
      useSettingsStore.getState().setTheme(theme);
      if (theme === 'system') {
        setColorScheme(deviceColorScheme === 'dark' ? 'dark' : 'light');
      } else {
        setColorScheme(theme);
      }
    },
  };
}
