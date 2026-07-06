import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Heart, Settings } from 'lucide-react-native';
import { HomeScreen } from '../features/home/HomeScreen';
import { FavoritesScreen } from '../features/favorites/FavoritesScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { MantraDetailsScreen } from '../features/mantra/MantraDetailsScreen';
import { useTheme } from '../hooks/useTheme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF9933',
        tabBarInactiveTintColor: isDark ? '#8E8E93' : '#AEAEB2',
        tabBarStyle: {
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          borderTopColor: isDark ? '#2D2D2D' : '#E5E7EB',
          paddingTop: 8,
          paddingBottom: 24,
          height: 84,
          position: 'relative',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Sanctuary',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="FavoritesTab"
        component={FavoritesScreen}
        options={{
          tabBarLabel: 'Favorites',
          tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: isDark ? '#121212' : '#FFF8F0',
        },
      }}
    >
      {/* Root Tabs */}
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      
      {/* Immersive Player modal */}
      <Stack.Screen
        name="MantraDetails"
        component={MantraDetailsScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      
      {/* Direct Push screens */}
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
