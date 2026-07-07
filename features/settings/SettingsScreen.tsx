import React from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Moon, Sun, Globe, Repeat, Timer, Bell, Info } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../store/settingsStore';
import { usePlayerStore } from '../../store/playerStore';
import { blurActiveElement } from '../../utils/blurActiveElement';

const TIMER_PRESETS = [0, 5, 15, 30, 60];
const REPEAT_PRESETS = [11, 21, 108, -1];

export const SettingsScreen: React.FC = () => {
  const { colors, colorScheme, setTheme } = useTheme();
  const navigation = useNavigation();

  const {
    language,
    theme: storedTheme,
    repeatTarget,
    notifications,
    setLanguage,
    setRepeatTarget,
    setNotifications,
  } = useSettingsStore();

  const {
    sleepTimerLeft,
    startSleepTimer,
    stopSleepTimer,
    currentMantra
  } = usePlayerStore();

  const formatSleepTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <SafeAreaView className="flex-1 bg-spiritual-sand dark:bg-spiritual-cosmic">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-gray-100 dark:border-neutral-900 bg-white dark:bg-spiritual-surfaceDark">
        <TouchableOpacity
          onPress={() => {
            blurActiveElement();
            navigation.goBack();
          }}
          className="p-1"
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-spiritual-charcoal dark:text-white ml-3">
          Settings
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: currentMantra ? 135 : 30 }}
        className="flex-1 px-5 pt-5"
      >
        {/* Theme Settings Card */}
        <View className="bg-white dark:bg-spiritual-surfaceDark rounded-3xl p-5 mb-5 shadow-sm border border-gray-50 dark:border-neutral-900">
          <View className="flex-row items-center mb-4">
            <Sun size={20} color="#FF9933" />
            <Text className="text-sm font-bold text-spiritual-charcoal dark:text-white ml-3">
              Theme / Appearance
            </Text>
          </View>
          
          <View className="flex-row bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-2xl">
            {(['light', 'dark', 'system'] as const).map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => setTheme(t)}
                className={`flex-1 py-3 rounded-xl ${
                  storedTheme === t
                    ? 'bg-white dark:bg-spiritual-surfaceDark shadow-sm'
                    : ''
                }`}
              >
                <Text
                  className={`text-xs font-bold text-center capitalize ${
                    storedTheme === t
                      ? 'text-spiritual-saffron'
                      : 'text-neutral-400'
                  }`}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sleep Timer Settings Card */}
        <View className="bg-white dark:bg-spiritual-surfaceDark rounded-3xl p-5 mb-5 shadow-sm border border-gray-50 dark:border-neutral-900">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Timer size={20} color="#FF9933" />
              <Text className="text-sm font-bold text-spiritual-charcoal dark:text-white ml-3">
                Sleep Timer
              </Text>
            </View>
            {sleepTimerLeft > 0 && (
              <Text className="text-xs font-bold text-spiritual-saffron">
                {formatSleepTimer(sleepTimerLeft)} left
              </Text>
            )}
          </View>
          
          <View className="flex-row flex-wrap gap-2.5 mb-3">
            {TIMER_PRESETS.map(mins => (
              <TouchableOpacity
                key={`timer-${mins}`}
                onPress={() => {
                  if (mins === 0) {
                    stopSleepTimer();
                  } else {
                    startSleepTimer(mins);
                  }
                }}
                className={`px-4 py-2.5 rounded-xl border ${
                  (mins === 0 && sleepTimerLeft === 0) ||
                  (mins > 0 && Math.round(sleepTimerLeft / 60) === mins)
                    ? 'bg-spiritual-saffron/10 dark:bg-spiritual-saffron/20 border-spiritual-saffron'
                    : 'bg-transparent border-gray-100 dark:border-neutral-800'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    (mins === 0 && sleepTimerLeft === 0) ||
                    (mins > 0 && Math.round(sleepTimerLeft / 60) === mins)
                      ? 'text-spiritual-saffron'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {mins === 0 ? 'Off' : `${mins} min`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Repeat limits setting */}
        <View className="bg-white dark:bg-spiritual-surfaceDark rounded-3xl p-5 mb-5 shadow-sm border border-gray-50 dark:border-neutral-900">
          <View className="flex-row items-center mb-4">
            <Repeat size={20} color="#FF9933" />
            <Text className="text-sm font-bold text-spiritual-charcoal dark:text-white ml-3">
              Default Mantra Loops
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-2.5">
            {REPEAT_PRESETS.map(preset => (
              <TouchableOpacity
                key={`preset-${preset}`}
                onPress={() => setRepeatTarget(preset)}
                className={`px-4 py-2.5 rounded-xl border ${
                  repeatTarget === preset
                    ? 'bg-spiritual-saffron/10 dark:bg-spiritual-saffron/20 border-spiritual-saffron'
                    : 'bg-transparent border-gray-100 dark:border-neutral-800'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    repeatTarget === preset
                      ? 'text-spiritual-saffron'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {preset === -1 ? 'Infinite' : `${preset} times`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* General settings toggle list */}
        <View className="bg-white dark:bg-spiritual-surfaceDark rounded-3xl p-5 mb-5 shadow-sm border border-gray-50 dark:border-neutral-900">
          {/* Notifications setting */}
          <View className="flex-row items-center justify-between pb-4 border-b border-neutral-50 dark:border-neutral-800">
            <View className="flex-row items-center">
              <Bell size={20} color="#FF9933" />
              <View className="ml-3">
                <Text className="text-sm font-bold text-spiritual-charcoal dark:text-white">
                  Chant Reminders
                </Text>
                <Text className="text-[10px] text-neutral-400 font-medium">Daily spiritual reminders</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#D1D5DB', true: '#FFB74D' }}
              thumbColor={notifications ? '#FF9933' : '#F3F4F6'}
            />
          </View>

          {/* Language UI setting */}
          <View className="flex-row items-center justify-between pt-4">
            <View className="flex-row items-center">
              <Globe size={20} color="#FF9933" />
              <View className="ml-3">
                <Text className="text-sm font-bold text-spiritual-charcoal dark:text-white">
                  App Language
                </Text>
                <Text className="text-[10px] text-neutral-400 font-medium">Current selection</Text>
              </View>
            </View>
            
            <View className="flex-row bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
              <TouchableOpacity
                onPress={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-lg ${language === 'en' ? 'bg-white dark:bg-spiritual-surfaceDark shadow-sm' : ''}`}
              >
                <Text className={`text-[10px] font-bold ${language === 'en' ? 'text-spiritual-saffron' : 'text-neutral-400'}`}>
                  English
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setLanguage('hi')}
                className={`px-3 py-1.5 rounded-lg ${language === 'hi' ? 'bg-white dark:bg-spiritual-surfaceDark shadow-sm' : ''}`}
              >
                <Text className={`text-[10px] font-bold ${language === 'hi' ? 'text-spiritual-saffron' : 'text-neutral-400'}`}>
                  Devanagari
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* About App Info */}
        <View className="bg-white dark:bg-spiritual-surfaceDark rounded-3xl p-5 mb-8 shadow-sm border border-gray-50 dark:border-neutral-900">
          <View className="flex-row items-center mb-3">
            <Info size={18} color="#FF9933" />
            <Text className="text-sm font-bold text-spiritual-charcoal dark:text-white ml-3">
              Mantra App Sanctuary
            </Text>
          </View>
          <Text className="text-xs text-neutral-400 leading-relaxed font-medium">
            Designed for meditation, peace, and spiritual mindfulness. Listen to Sanskrit chants with synchronized Devanagari lyrics.
          </Text>
          
          <View className="border-t border-neutral-50 dark:border-neutral-800 mt-4 pt-3 flex-row justify-between">
            <Text className="text-[10px] text-neutral-400 font-semibold">Version 1.0.0 (Expo SDK 57)</Text>
            <Text className="text-[10px] text-spiritual-saffron font-bold">Made with 🙏</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
export default SettingsScreen;
