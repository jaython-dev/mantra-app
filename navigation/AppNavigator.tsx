import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNavigationContainerRef } from '@react-navigation/native';
import { Home, BookOpen, Download, Bookmark, User } from 'lucide-react-native';

export const navigationRef = createNavigationContainerRef();

import { HomeScreen } from '../features/home/HomeScreen';
import { LibraryScreen } from '../features/library/LibraryScreen';
import { BookDetailsScreen } from '../features/library/BookDetailsScreen';
import { PDFViewerScreen } from '../features/library/PDFViewerScreen';
import { ReaderScreen } from '../features/reader/ReaderScreen';
import { DownloadsScreen } from '../features/downloads/DownloadsScreen';
import { BookmarksScreen } from '../features/bookmarks/BookmarksScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';
import { SearchScreen } from '../features/search/SearchScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { MantraDetailsScreen } from '../features/mantra/MantraDetailsScreen';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';
import { AuthScreen } from '../features/profile/AuthScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7A1E1E', // Temple Maroon active highlight
        tabBarInactiveTintColor: isDark ? '#8E8E93' : '#8C7A6B',
        tabBarStyle: {
          backgroundColor: isDark ? '#120E0D' : '#FAF7F2', // Ivory / Dark Clay Background
          borderTopColor: isDark ? '#2D221F' : '#E6DFD3',
          paddingTop: 8,
          paddingBottom: 24,
          height: 84,
          position: 'relative',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.5,
          fontFamily: 'Inter',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Sanctuary',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="LibraryTab"
        component={LibraryScreen}
        options={{
          tabBarLabel: 'Library',
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="DownloadsTab"
        component={DownloadsScreen}
        options={{
          tabBarLabel: 'Downloads',
          tabBarIcon: ({ color, size }) => <Download size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="BookmarksTab"
        component={BookmarksScreen}
        options={{
          tabBarLabel: 'Sanctuary Log',
          tabBarIcon: ({ color, size }) => <Bookmark size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { isDark } = useTheme();
  const { token } = useAuthStore();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: isDark ? '#120E0D' : '#FAF7F2',
        },
      }}
    >
      {token ? (
        <>
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
          <Stack.Screen name="BookDetails" component={BookDetailsScreen} />
          <Stack.Screen name="PDFViewer" component={PDFViewerScreen} />
          <Stack.Screen name="Reader" component={ReaderScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
