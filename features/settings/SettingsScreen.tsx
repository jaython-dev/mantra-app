import React from 'react';
import { View, Text, ScrollView, Switch, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Moon, Sun, Globe, Repeat, Timer, Bell, Info, Sliders, Type, Database, Shield } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../store/settingsStore';
import { usePlayerStore } from '../../store/playerStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import { blurActiveElement } from '../../utils/blurActiveElement';
import { ScriptureCard, DividerDecoration } from '../../components/ui/DesignSystem';

const TIMER_PRESETS = [0, 15, 30, 60];
const REPEAT_PRESETS = [11, 21, 108, -1];

export const SettingsScreen: React.FC = () => {
  const { isDark, setTheme } = useTheme();
  const navigation = useNavigation();

  const {
    language,
    theme: storedTheme,
    repeatTarget,
    notifications,
    fontSize,
    eqPreset,
    setLanguage,
    setRepeatTarget,
    setNotifications,
    setFontSize,
    setEqPreset,
  } = useSettingsStore();

  const {
    sleepTimerLeft,
    startSleepTimer,
    stopSleepTimer,
    currentMantra
  } = usePlayerStore();

  const { downloadedChapters, toggleChapterDownload } = useFavoritesStore();

  const formatSleepTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Audio Cache',
      'Are you sure you want to clear all downloaded audios and scriptures to free up storage?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            downloadedChapters.forEach((chId) => {
              toggleChapterDownload(chId);
            });
            Alert.alert('Success', 'Offline cache has been successfully cleared.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2] dark:bg-[#120E0D]">
      {/* AppBar Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-[#E6DFD3] dark:border-[#2D221F] bg-white dark:bg-[#1C1513]">
        <Pressable
          onPress={() => {
            blurActiveElement();
            navigation.goBack();
          }}
          className="p-1 rounded-full active:bg-[#E6DFD3]/40"
        >
          <ArrowLeft size={22} color="#7A1E1E" />
        </Pressable>
        <Text className="text-base font-bold text-[#7A1E1E] dark:text-[#E6DFD3] ml-4 font-inter">
          App Configurations
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: currentMantra ? 140 : 40, paddingTop: 20 }}
      >
        {/* Appearance Settings Card */}
        <View className="bg-white dark:bg-[#1C1513] border border-[#E6DFD3] dark:border-[#3A2A25] rounded-[20px] p-5 mb-5 shadow-sm">
          <View className="flex-row items-center mb-4">
            <Sun size={18} color="#7A1E1E" />
            <Text className="text-sm font-bold text-[#3A2E2B] dark:text-white ml-3 font-inter">
              Theme / Appearance
            </Text>
          </View>
          
          <View className="flex-row bg-[#FAF7F2] dark:bg-[#2A1E1C] p-1.5 rounded-2xl border border-[#E6DFD3] dark:border-[#3D2C28]">
            {(['light', 'dark', 'system'] as const).map(t => (
              <Pressable
                key={t}
                onPress={() => setTheme(t)}
                className={`flex-1 py-2.5 rounded-xl ${
                  storedTheme === t
                    ? 'bg-white dark:bg-[#1C1513] border border-[#E6DFD3]/50 shadow-sm'
                    : ''
                }`}
              >
                <Text
                  className={`text-xs font-bold text-center capitalize font-inter ${
                    storedTheme === t
                      ? 'text-[#7A1E1E] dark:text-[#D4AF37]'
                      : 'text-neutral-400'
                  }`}
                >
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Font adjustments */}
        <View className="bg-white dark:bg-[#1C1513] border border-[#E6DFD3] dark:border-[#3A2A25] rounded-[20px] p-5 mb-5 shadow-sm">
          <View className="flex-row items-center mb-4">
            <Type size={18} color="#7A1E1E" />
            <Text className="text-sm font-bold text-[#3A2E2B] dark:text-white ml-3 font-inter">
              Text & Fonts Size
            </Text>
          </View>
          <View className="flex-row items-center justify-between bg-[#FAF7F2] dark:bg-[#2A1E1C] border border-[#E6DFD3] dark:border-[#3D2C28] rounded-2xl p-3">
            <Pressable
              onPress={() => setFontSize(Math.max(16, fontSize - 2))}
              className="w-8 h-8 rounded-lg bg-[#7A1E1E]/5 items-center justify-center border border-[#7A1E1E]/15 active:scale-95"
            >
              <Text className="text-sm font-bold text-[#7A1E1E]">-</Text>
            </Pressable>
            <Text className="text-xs font-bold text-[#3A2E2B] dark:text-neutral-200 font-inter">
              {fontSize} px (Devanāgarī)
            </Text>
            <Pressable
              onPress={() => setFontSize(Math.min(36, fontSize + 2))}
              className="w-8 h-8 rounded-lg bg-[#7A1E1E]/5 items-center justify-center border border-[#7A1E1E]/15 active:scale-95"
            >
              <Text className="text-sm font-bold text-[#7A1E1E]">+</Text>
            </Pressable>
          </View>
        </View>

        {/* Sleep Timer Settings Card */}
        <View className="bg-white dark:bg-[#1C1513] border border-[#E6DFD3] dark:border-[#3A2A25] rounded-[20px] p-5 mb-5 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Timer size={18} color="#7A1E1E" />
              <Text className="text-sm font-bold text-[#3A2E2B] dark:text-white ml-3 font-inter">
                Sleep Timer Preset
              </Text>
            </View>
            {sleepTimerLeft > 0 && (
              <Text className="text-xs font-bold text-[#7A1E1E] dark:text-[#D4AF37] font-inter">
                {formatSleepTimer(sleepTimerLeft)} left
              </Text>
            )}
          </View>
          
          <View className="flex-row justify-between">
            {TIMER_PRESETS.map(mins => (
              <Pressable
                key={`timer-${mins}`}
                onPress={() => {
                  if (mins === 0) {
                    stopSleepTimer();
                  } else {
                    startSleepTimer(mins);
                  }
                }}
                className={`flex-1 py-2.5 mx-1 rounded-xl border items-center justify-center active:scale-95 ${
                  (mins === 0 && sleepTimerLeft === 0) ||
                  (mins > 0 && Math.round(sleepTimerLeft / 60) === mins)
                    ? 'bg-[#7A1E1E]/5 dark:bg-[#7A1E1E]/20 border-[#7A1E1E]'
                    : 'bg-transparent border-[#E6DFD3] dark:border-neutral-800'
                }`}
              >
                <Text
                  className={`text-[10px] font-bold font-inter ${
                    (mins === 0 && sleepTimerLeft === 0) ||
                    (mins > 0 && Math.round(sleepTimerLeft / 60) === mins)
                      ? 'text-[#7A1E1E] dark:text-[#D4AF37]'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {mins === 0 ? 'Off' : `${mins} min`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Repeat limits setting */}
        <View className="bg-white dark:bg-[#1C1513] border border-[#E6DFD3] dark:border-[#3A2A25] rounded-[20px] p-5 mb-5 shadow-sm">
          <View className="flex-row items-center mb-4">
            <Repeat size={18} color="#7A1E1E" />
            <Text className="text-sm font-bold text-[#3A2E2B] dark:text-white ml-3 font-inter">
              Default Mantra Loops
            </Text>
          </View>
          <View className="flex-row justify-between">
            {REPEAT_PRESETS.map(preset => (
              <Pressable
                key={`preset-${preset}`}
                onPress={() => setRepeatTarget(preset)}
                className={`flex-1 py-2.5 mx-1 rounded-xl border items-center justify-center active:scale-95 ${
                  repeatTarget === preset
                    ? 'bg-[#7A1E1E]/5 dark:bg-[#7A1E1E]/20 border-[#7A1E1E]'
                    : 'bg-transparent border-[#E6DFD3] dark:border-neutral-800'
                }`}
              >
                <Text
                  className={`text-[10px] font-bold font-inter ${
                    repeatTarget === preset
                      ? 'text-[#7A1E1E] dark:text-[#D4AF37]'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {preset === -1 ? 'Loop' : `${preset}x`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Audio Equalizer settings shortcut */}
        <View className="bg-white dark:bg-[#1C1513] border border-[#E6DFD3] dark:border-[#3A2A25] rounded-[20px] p-5 mb-5 shadow-sm">
          <View className="flex-row items-center mb-4">
            <Sliders size={18} color="#7A1E1E" />
            <Text className="text-sm font-bold text-[#3A2E2B] dark:text-white ml-3 font-inter">
              Equalizer Acoustical Preset
            </Text>
          </View>
          <View className="flex-row bg-[#FAF7F2] dark:bg-[#2A1E1C] p-1.5 rounded-2xl border border-[#E6DFD3] dark:border-[#3D2C28]">
            {['flat', 'meditation', 'vocal', 'temple'].map(preset => (
              <Pressable
                key={preset}
                onPress={() => setEqPreset(preset as any)}
                className={`flex-1 py-2 rounded-lg items-center ${eqPreset === preset ? 'bg-white dark:bg-[#1C1513] border border-[#E6DFD3]/50 shadow-sm' : ''}`}
              >
                <Text className={`text-[10px] font-bold uppercase tracking-wider font-inter ${eqPreset === preset ? 'text-[#7A1E1E] dark:text-[#D4AF37]' : 'text-neutral-400'}`}>
                  {preset}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Toggles settings list */}
        <View className="bg-white dark:bg-[#1C1513] border border-[#E6DFD3] dark:border-[#3A2A25] rounded-[20px] p-5 mb-5 shadow-sm">
          {/* Notifications setting */}
          <View className="flex-row items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <View className="flex-row items-center">
              <Bell size={18} color="#7A1E1E" />
              <View className="ml-3">
                <Text className="text-sm font-bold text-[#3A2E2B] dark:text-white font-inter">
                  Chant Reminders
                </Text>
                <Text className="text-[10px] text-neutral-400 font-inter">Daily morning prayer streak alert</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#D1D5DB', true: '#7A1E1E' }}
              thumbColor={notifications ? '#D4AF37' : '#F3F4F6'}
            />
          </View>

          {/* Storage Cache clean */}
          <View className="flex-row items-center justify-between pt-4">
            <View className="flex-row items-center">
              <Database size={18} color="#7A1E1E" />
              <View className="ml-3">
                <Text className="text-sm font-bold text-[#3A2E2B] dark:text-white font-inter">
                  Offline Audio Cache
                </Text>
                <Text className="text-[10px] text-neutral-400 font-inter">Free up device storage</Text>
              </View>
            </View>
            <Pressable
              onPress={handleClearCache}
              className="px-4 py-2 border border-red-500/20 bg-red-500/5 rounded-xl active:scale-95"
            >
              <Text className="text-[10px] font-bold text-red-500 uppercase tracking-wider font-inter">
                Clear
              </Text>
            </Pressable>
          </View>
        </View>

        {/* About App Info */}
        <View className="bg-white dark:bg-[#1C1513] border border-[#E6DFD3] dark:border-[#3A2A25] rounded-[20px] p-5 mb-8 shadow-sm">
          <View className="flex-row items-center mb-3">
            <Info size={16} color="#7A1E1E" />
            <Text className="text-sm font-bold text-[#3A2E2B] dark:text-white ml-3 font-inter">
              Sanctuary Scripture App
            </Text>
          </View>
          <Text className="text-xs text-neutral-400 leading-relaxed font-medium font-inter">
            Designed for meditation, scripture dhyana, and spiritual reading. Includes high fidelity Noto Sans Devanāgarī fonts and synchronized chanting recitations.
          </Text>
          
          <View className="border-t border-neutral-100 dark:border-neutral-800 mt-4 pt-3 flex-row justify-between">
            <Text className="text-[9px] text-neutral-400 font-semibold font-inter">Version 1.0.0 (Expo v57)</Text>
            <Text className="text-[9px] text-[#7A1E1E] dark:text-[#D4AF37] font-bold font-inter">Made in Sanctuary 🙏</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
