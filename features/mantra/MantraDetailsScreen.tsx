import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  LayoutChangeEvent,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ChevronDown,
  Repeat,
  Gauge,
  Layers,
  Heart,
} from 'lucide-react-native';
import { usePlayerStore } from '../../store/playerStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useTheme } from '../../hooks/useTheme';
import { formatTime } from '../../utils/formatTime';
import { LyricItem } from '../../components/LyricItem';
import { MANTRAS, Mantra } from '../../utils/mantraData';
import { blurActiveElement } from '../../utils/blurActiveElement';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
const REPEAT_TARGETS = [11, 21, 108, -1]; // -1 represents loop infinite

export const MantraDetailsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  const { mantraId } = route.params || {};
  const selectedMantra = MANTRAS.find(m => m.id === mantraId);

  const {
    currentMantra,
    playbackState,
    position,
    duration,
    playbackSpeed,
    repeatMode,
    repeatCount,
    activeLyricIndex,
    playMantra,
    pause,
    resume,
    seek,
    next,
    previous,
    setPlaybackSpeed,
    setRepeatMode,
    resetRepeatCount,
    setFullPlayerOpen,
  } = usePlayerStore();

  const toggleFavorite = useFavoritesStore(state => state.toggleFavorite);
  const isFav = useFavoritesStore(state => state.isFavorite(mantraId));

  const { repeatTarget, setRepeatTarget } = useSettingsStore();

  // Layout states for lyrics scroll positioning
  const scrollViewRef = useRef<ScrollView>(null);
  const [verseLayouts, setVerseLayouts] = useState<Record<number, number>>({});
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showRepeatMenu, setShowRepeatMenu] = useState(false);
  const [sliderWidth, setSliderWidth] = useState(0);

  // Toggle full player visibility state to hide mini player
  useEffect(() => {
    setFullPlayerOpen(true);
    return () => {
      setFullPlayerOpen(false);
    };
  }, []);

  // If a different mantra was tapped, play it immediately on entry
  useEffect(() => {
    if (selectedMantra && (!currentMantra || currentMantra.id !== selectedMantra.id)) {
      playMantra(selectedMantra);
    }
  }, [selectedMantra]);

  // Autoscroll lyrics to center the active verse
  useEffect(() => {
    if (activeLyricIndex !== -1 && verseLayouts[activeLyricIndex] !== undefined) {
      const yOffset = verseLayouts[activeLyricIndex] - 120; // Offset spacing to align active item
      scrollViewRef.current?.scrollTo({
        y: Math.max(0, yOffset),
        animated: true,
      });
    }
  }, [activeLyricIndex, verseLayouts]);

  if (!selectedMantra) {
    return (
      <View className="flex-1 bg-spiritual-sand items-center justify-center">
        <Text className="text-red-500 font-bold">Mantra not found</Text>
      </View>
    );
  }

  const isPlaying = playbackState === 'playing';
  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

  // Custom Seek Handler
  const handleProgressBarPress = (event: any) => {
    const pressX = event.nativeEvent.locationX;
    if (sliderWidth > 0) {
      const percentage = pressX / sliderWidth;
      const targetSeconds = percentage * duration;
      seek(targetSeconds);
    }
  };

  const handleLayoutVerse = (index: number, event: LayoutChangeEvent) => {
    const { y } = event.nativeEvent.layout;
    setVerseLayouts(prev => ({ ...prev, [index]: y }));
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const getRepeatTargetLabel = (target: number) => {
    return target === -1 ? 'Loop' : `${target}x`;
  };

  return (
    <SafeAreaView className="flex-1 bg-spiritual-sand dark:bg-spiritual-cosmic">
      {/* Top action header bar */}
      <View className="flex-row justify-between items-center px-6 py-4">
        <TouchableOpacity
          onPress={() => {
            blurActiveElement();
            navigation.goBack();
          }}
          className="p-1"
        >
          <ChevronDown size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text className="text-xs uppercase tracking-widest font-bold text-neutral-400 dark:text-neutral-500 text-center">
          Listening to Mantra
        </Text>

        <TouchableOpacity onPress={() => toggleFavorite(selectedMantra.id)} className="p-1">
          <Heart
            size={22}
            color={isFav ? '#EF4444' : colors.text}
            fill={isFav ? '#EF4444' : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-6 justify-between pb-6">
        {/* Top Info (Cover & Title) */}
        <View className="items-center">
          {/* Cover Art */}
          <View
            style={{ 
              width: Math.min(SCREEN_WIDTH * 0.48, 180), 
              height: Math.min(SCREEN_WIDTH * 0.48, 180) 
            }}
            className="rounded-3xl overflow-hidden shadow-md border border-gray-200/50 dark:border-neutral-900 bg-white"
          >
            <Image
              source={selectedMantra.cover}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>

          {/* Title / Description info */}
          <View className="items-center mt-3">
            <Text className="text-xl font-black text-spiritual-charcoal dark:text-white text-center">
              {selectedMantra.title}
            </Text>
            <Text className="text-xs font-semibold text-spiritual-amber dark:text-spiritual-saffronLight mt-0.5 uppercase tracking-widest">
              {selectedMantra.deity} • {selectedMantra.category}
            </Text>
            <Text numberOfLines={2} className="text-[11px] text-neutral-400 dark:text-neutral-500 text-center px-4 mt-2 leading-relaxed">
              {selectedMantra.description}
            </Text>
          </View>
        </View>

        {/* Dynamic Auto-Scrolling Lyrics Section (Flex Fill) */}
        <View className="flex-1 my-4 rounded-3xl bg-white/40 dark:bg-spiritual-surfaceDark/30 border border-white/50 dark:border-neutral-900/40 p-4">
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
          >
            {selectedMantra.lyrics && selectedMantra.lyrics.verses ? (
              selectedMantra.lyrics.verses.map((verse: any, idx: number) => (
                <View
                  key={`verse-${idx}`}
                  onLayout={(e) => handleLayoutVerse(idx, e)}
                >
                  <LyricItem
                    text={verse.text}
                    translation={verse.translation}
                    isActive={idx === activeLyricIndex}
                    onPress={() => seek(verse.start)}
                  />
                </View>
              ))
            ) : (
              <Text className="text-center text-neutral-400 my-10">No lyrics available</Text>
            )}
          </ScrollView>
        </View>

        {/* Bottom Control & Info Panel */}
        <View>
          {/* Repetition Counter Widget */}
          <View className="flex-row items-center justify-between bg-white dark:bg-spiritual-surfaceDark/50 rounded-2xl p-3 mb-4 shadow-sm border border-gray-50 dark:border-neutral-900">
            <View className="flex-row items-center">
              <Layers size={16} color="#FF9933" />
              <View className="ml-3">
                <Text className="text-[10px] font-semibold text-neutral-400">Repetitions</Text>
                <Text className="text-xs font-bold text-spiritual-charcoal dark:text-white mt-0.5">
                  Target: {getRepeatTargetLabel(repeatTarget)}
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-center space-x-3">
              <View className="bg-spiritual-saffron/10 dark:bg-spiritual-saffron/20 px-2.5 py-1 rounded-lg">
                <Text className="text-[10px] font-bold text-spiritual-amber dark:text-spiritual-saffronLight">
                  Played: {repeatCount} times
                </Text>
              </View>
              <TouchableOpacity onPress={resetRepeatCount} className="p-1">
                <Text className="text-[10px] text-neutral-400 font-semibold underline">Reset</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Custom Seek Progress Bar */}
          <View className="mb-4">
            <Pressable
              onPress={handleProgressBarPress}
              onLayout={(e: LayoutChangeEvent) => setSliderWidth(e.nativeEvent.layout.width)}
              className="h-2 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden justify-center"
            >
              <View
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-spiritual-saffron rounded-full"
              />
            </Pressable>
            
            <View className="flex-row justify-between items-center mt-2">
              <Text className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">
                {formatTime(position)}
              </Text>
              <Text className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">
                {formatTime(duration)}
              </Text>
            </View>
          </View>

          {/* Playback Settings Quick Actions */}
          <View className="flex-row justify-around items-center mb-4">
            {/* Speed Action */}
            <View className="relative items-center">
              <TouchableOpacity
                onPress={() => {
                  setShowSpeedMenu(!showSpeedMenu);
                  setShowRepeatMenu(false);
                }}
                className="flex-row items-center bg-white dark:bg-spiritual-surfaceDark px-3.5 py-2 rounded-full border border-gray-100 dark:border-neutral-900"
              >
                <Gauge size={12} color="#FF9933" />
                <Text className="text-[11px] font-bold text-spiritual-charcoal dark:text-white ml-2">
                  Speed: {playbackSpeed}x
                </Text>
              </TouchableOpacity>

              {showSpeedMenu && (
                <View className="absolute bottom-11 w-24 bg-white dark:bg-spiritual-surfaceDark border border-gray-100 dark:border-neutral-900 rounded-2xl shadow-xl p-1.5 z-50">
                  {SPEED_OPTIONS.map(opt => (
                    <TouchableOpacity
                      key={`speed-${opt}`}
                      onPress={() => {
                        setPlaybackSpeed(opt);
                        setShowSpeedMenu(false);
                      }}
                      className="py-2 px-2.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      <Text className={`text-[11px] text-center font-semibold ${playbackSpeed === opt ? 'text-spiritual-saffron' : 'text-neutral-500'}`}>
                        {opt}x
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Repeat Limit Action */}
            <View className="relative items-center">
              <TouchableOpacity
                onPress={() => {
                  setShowRepeatMenu(!showRepeatMenu);
                  setShowSpeedMenu(false);
                }}
                className="flex-row items-center bg-white dark:bg-spiritual-surfaceDark px-3.5 py-2 rounded-full border border-gray-100 dark:border-neutral-900"
              >
                <Repeat size={12} color="#FF9933" />
                <Text className="text-[11px] font-bold text-spiritual-charcoal dark:text-white ml-2">
                  Limit: {getRepeatTargetLabel(repeatTarget)}
                </Text>
              </TouchableOpacity>

              {showRepeatMenu && (
                <View className="absolute bottom-11 w-24 bg-white dark:bg-spiritual-surfaceDark border border-gray-100 dark:border-neutral-900 rounded-2xl shadow-xl p-1.5 z-50">
                  {REPEAT_TARGETS.map(opt => (
                    <TouchableOpacity
                      key={`target-${opt}`}
                      onPress={() => {
                        setRepeatTarget(opt);
                        setShowRepeatMenu(false);
                      }}
                      className="py-2 px-2.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      <Text className={`text-[11px] text-center font-semibold ${repeatTarget === opt ? 'text-spiritual-saffron' : 'text-neutral-500'}`}>
                        {getRepeatTargetLabel(opt)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Primary Audio Player Actions */}
          <View className="flex-row justify-center items-center space-x-8 mb-4">
            {/* Skip Back */}
            <TouchableOpacity onPress={previous} className="p-2">
              <SkipBack size={24} color={colors.text} fill={colors.text} />
            </TouchableOpacity>

            {/* Play/Pause Main */}
            <TouchableOpacity
              onPress={togglePlayPause}
              className="w-16 h-16 bg-spiritual-saffron rounded-full items-center justify-center shadow-md active:scale-95 transition-all duration-100"
            >
              {isPlaying ? (
                <Pause size={28} color="white" fill="white" />
              ) : (
                <Play size={28} color="white" fill="white" className="ml-1" />
              )}
            </TouchableOpacity>

            {/* Skip Forward */}
            <TouchableOpacity onPress={next} className="p-2">
              <SkipForward size={24} color={colors.text} fill={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
export default MantraDetailsScreen;
