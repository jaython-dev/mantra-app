import React from 'react';
import { View, Text, Image, Pressable, TouchableOpacity } from 'react-native';
import { Play, Pause, ChevronRight } from 'lucide-react-native';
import { navigationRef } from '../navigation/AppNavigator';
import { usePlayerStore } from '../store/playerStore';
import { useTheme } from '../hooks/useTheme';
import { blurActiveElement } from '../utils/blurActiveElement';

export const MiniPlayer: React.FC = () => {
  const { colors } = useTheme();
  
  const {
    currentMantra,
    playbackState,
    position,
    duration,
    pause,
    resume,
    isFullPlayerOpen
  } = usePlayerStore();

  if (!currentMantra || isFullPlayerOpen) return null;

  const isPlaying = playbackState === 'playing';
  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

  const handlePlayPause = (e: any) => {
    e.stopPropagation();
    blurActiveElement();
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  return (
    <Pressable
      onPress={() => {
        blurActiveElement();
        if (navigationRef.isReady()) {
          (navigationRef as any).navigate('MantraDetails', { mantraId: currentMantra.id });
        }
      }}
      style={{
        position: 'absolute',
        bottom: 96,
        left: 16,
        right: 16,
        height: 72,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
      }}
      className="bg-white/95 dark:bg-spiritual-surfaceDark/95 border border-gray-100 dark:border-neutral-900 rounded-3xl shadow-xl overflow-hidden active:scale-[0.99] transition-all duration-150"
    >
      {/* Progress Bar top indicator */}
      <View
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3 }}
        className="bg-neutral-100 dark:bg-neutral-800"
      >
        <View
          style={{ width: `${progressPercent}%`, height: '100%' }}
          className="bg-spiritual-saffron"
        />
      </View>

      {/* Cover Image */}
      <Image
        source={currentMantra.cover}
        style={{ width: 44, height: 44, borderRadius: 12 }}
        className="shadow-sm mr-3 bg-neutral-100"
      />

      {/* Info details */}
      <View className="flex-1 justify-center pr-3">
        <Text
          numberOfLines={1}
          className="text-sm font-bold text-spiritual-charcoal dark:text-white"
        >
          {currentMantra.title}
        </Text>
        <Text
          numberOfLines={1}
          className="text-xs text-neutral-400 dark:text-neutral-500 font-medium"
        >
          {currentMantra.deity} • Listening Now
        </Text>
      </View>

      {/* Play/Pause controls */}
      <View className="flex-row items-center space-x-3">
        <TouchableOpacity
          onPress={handlePlayPause}
          className="w-10 h-10 rounded-full bg-spiritual-saffron items-center justify-center shadow-sm active:scale-95"
        >
          {isPlaying ? (
            <Pause size={18} color="white" fill="white" />
          ) : (
            <Play size={18} color="white" fill="white" className="ml-0.5" />
          )}
        </TouchableOpacity>
        <ChevronRight size={18} color={colors.textMuted} />
      </View>
    </Pressable>
  );
};
export default MiniPlayer;
