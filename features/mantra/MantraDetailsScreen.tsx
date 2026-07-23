import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  Dimensions,
  Modal,
  StyleSheet,
  Share,
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
  Music,
  Clock,
  Download,
  Share2,
  X,
  Settings,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';
import { usePlayerStore } from '../../store/playerStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useSettingsStore } from '../../store/settingsStore';
import { formatTime } from '../../utils/formatTime';
import { MANTRAS, Mantra } from '../../utils/mantraData';
import { blurActiveElement } from '../../utils/blurActiveElement';
import { DividerDecoration } from '../../components/ui/DesignSystem';
import { getBaseUrl } from '../../services/api/apiClient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
const REPEAT_TARGETS = [11, 21, 108, -1]; // -1 represents loop infinite

export const MantraDetailsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  
  const { mantraId } = route.params || {};
  const [imageFailed, setImageFailed] = useState(false);

  // Stores
  const {
    currentMantra,
    playbackState,
    position,
    duration,
    playbackSpeed,
    repeatMode,
    repeatCount,
    sleepTimerLeft,
    playMantra,
    pause,
    resume,
    seek,
    next,
    previous,
    setPlaybackSpeed,
    setRepeatMode,
    resetRepeatCount,
    startSleepTimer,
    stopSleepTimer,
    setFullPlayerOpen,
  } = usePlayerStore();

  // Dynamic track resolution: prioritize currently playing dynamic track, fallback to param lookup
  const selectedMantra = currentMantra || (mantraId ? MANTRAS.find(m => m.id === mantraId) : null);

  const toggleFavorite = useFavoritesStore(state => state.toggleFavorite);
  const isFav = selectedMantra ? useFavoritesStore(state => state.isFavorite(selectedMantra.id)) : false;
  const { toggleChapterDownload, isChapterDownloaded } = useFavoritesStore();

  const { repeatTarget, setRepeatTarget, eqPreset, setEqPreset } = useSettingsStore();

  // Bottom Sheets Overlays
  const [showSpeedSheet, setShowSpeedSheet] = useState(false);
  const [showTimerSheet, setShowTimerSheet] = useState(false);
  const [showEqSheet, setShowEqSheet] = useState(false);
  const [showRepeatSheet, setShowRepeatSheet] = useState(false);
  const [sliderWidth, setSliderWidth] = useState(0);

  // Equalizer Slider state
  const [eqBands, setEqBands] = useState([60, 45, 50, 75, 65]);

  useEffect(() => {
    setFullPlayerOpen(true);
    return () => {
      setFullPlayerOpen(false);
    };
  }, []);

  // Only auto-play if a specific mantraId was passed via navigation and differs from active track
  useEffect(() => {
    if (mantraId && (!currentMantra || currentMantra.id !== mantraId)) {
      const target = MANTRAS.find(m => m.id === mantraId);
      if (target) {
        playMantra(target);
      }
    }
  }, [mantraId]);

  const isPlaying = playbackState === 'playing';
  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

  const handleProgressBarPress = (event: any) => {
    const pressX = event.nativeEvent.locationX;
    if (sliderWidth > 0) {
      const percentage = pressX / sliderWidth;
      const targetSeconds = percentage * duration;
      seek(targetSeconds);
    }
  };

  const togglePlayPause = () => {
    blurActiveElement();
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Listening to "${selectedMantra?.title || 'Scripture'}" — dedicated to ${selectedMantra?.deity || 'Devotion'}.\nChant along and listen to the audiobook. Download the Sanctuary app today!`,
      });
    } catch {}
  };

  const handlePresetSelect = (preset: string) => {
    setEqPreset(preset as any);
    if (preset === 'meditation') {
      setEqBands([40, 35, 60, 50, 40]);
    } else if (preset === 'vocal') {
      setEqBands([30, 45, 80, 85, 60]);
    } else if (preset === 'temple') {
      setEqBands([80, 70, 50, 60, 85]);
    } else {
      setEqBands([50, 50, 50, 50, 50]);
    }
  };

  const getRepeatTargetLabel = (target: number) => {
    return target === -1 ? 'Loop' : `${target}x`;
  };

  const getFallbackCover = () => {
    const textToMatch = `${selectedMantra?.title || ''} ${selectedMantra?.deity || ''} ${selectedMantra?.category || ''}`.toLowerCase();
    if (textToMatch.includes('brahmpath') || textToMatch.includes('audiobook') || textToMatch.includes('scripture')) {
      return require('../../assets/images/brahmpath_main.png');
    }
    if (textToMatch.includes('bodhan')) {
      return require('../../assets/images/shiv_bodhan_cover.png');
    }
    if (textToMatch.includes('kush')) {
      return require('../../assets/images/kush_pavitrikaran_cover.png');
    }
    if (textToMatch.includes('deh')) {
      return require('../../assets/images/deh_pavitrikaran_cover.png');
    }
    if (textToMatch.includes('tandava')) {
      return require('../../assets/images/shivatandava.png');
    }
    if (textToMatch.includes('mrityunjaya') || textToMatch.includes('healing')) {
      return require('../../assets/images/mahamrityunjaya.png');
    }
    if (textToMatch.includes('ganesh') || textToMatch.includes('ganpati')) {
      return require('../../assets/images/ganesha.png');
    }
    if (textToMatch.includes('gayatri')) {
      return require('../../assets/images/gayatri.png');
    }
    if (textToMatch.includes('krishna') || textToMatch.includes('gita') || textToMatch.includes('rama')) {
      return require('../../assets/images/harekrishna.png');
    }
    return require('../../assets/images/brahmpath_main.png');
  };

  const getCoverSource = (cover: any) => {
    if (typeof cover === 'number') return cover;
    
    let uriString = '';
    if (cover && typeof cover === 'object') {
      if (typeof cover.uri === 'string') {
        uriString = cover.uri.trim();
      } else if (cover.uri && typeof cover.uri === 'object' && typeof cover.uri.uri === 'string') {
        uriString = cover.uri.uri.trim();
      }
    } else if (typeof cover === 'string') {
      uriString = cover.trim();
    }

    if (uriString.length > 0) {
      if (uriString.startsWith('http://') || uriString.startsWith('https://') || uriString.startsWith('file://') || uriString.startsWith('data:')) {
        return { uri: uriString };
      }
      // Convert relative backend media path to absolute server URL
      const baseHost = getBaseUrl().replace('/api/v1', '');
      const cleanPath = uriString.startsWith('/') ? uriString : `/${uriString}`;
      return { uri: `${baseHost}${cleanPath}` };
    }

    return getFallbackCover();
  };

  const fallbackCover = getFallbackCover();
  const coverSource = getCoverSource(selectedMantra?.cover);

  return (
    <View style={styles.container} className="bg-[#120E0D]">
      {/* Ambient spiritual background glow */}
      <View style={StyleSheet.absoluteFill} className="opacity-25">
        <Image
          source={imageFailed ? fallbackCover : coverSource}
          onError={() => setImageFailed(true)}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
          blurRadius={60}
        />
      </View>

      <SafeAreaView className="flex-1 justify-between pb-6">
        {/* Top Header Controls */}
        <View className="flex-row justify-between items-center px-6 pt-3 pb-2">
          <Pressable
            onPress={() => {
              blurActiveElement();
              navigation.goBack();
            }}
            style={{ width: 42, height: 42, borderRadius: 21 }}
            className="bg-white/10 border border-white/20 items-center justify-center active:scale-95 shadow-sm"
          >
            <ChevronDown size={22} color="#FAF7F2" />
          </Pressable>

          <View className="items-center">
            <Text className="text-[11px] text-[#D4AF37] font-black uppercase tracking-[0.25em] text-center font-inter">
              Listening Sanctuary
            </Text>
            <View className="w-6 h-[1.5px] bg-[#D4AF37]/50 rounded-full mt-1" />
          </View>

          <Pressable
            onPress={() => selectedMantra && toggleFavorite(selectedMantra.id)}
            style={{ width: 42, height: 42, borderRadius: 21 }}
            className="bg-white/10 border border-white/20 items-center justify-center active:scale-95 shadow-sm"
          >
            <Heart
              size={19}
              color={selectedMantra && isFav ? '#EF4444' : '#FAF7F2'}
              fill={selectedMantra && isFav ? '#EF4444' : 'transparent'}
            />
          </Pressable>
        </View>

        {/* Cover Art Card */}
        <View className="items-center px-8 my-auto py-2">
          <View
            style={{
              shadowColor: '#D4AF37',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.35,
              shadowRadius: 24,
              elevation: 12,
            }}
            className="rounded-[32px] overflow-hidden border-2 border-[#D4AF37]/80 w-64 h-64 bg-[#1C1513] justify-center items-center"
          >
            <Image
              source={imageFailed ? fallbackCover : coverSource}
              onError={() => setImageFailed(true)}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Title & Category Details */}
        <View className="items-center px-6 mt-1">
          <Text numberOfLines={1} className="text-2xl font-black text-[#FAF7F2] text-center font-inter tracking-tight">
            {selectedMantra?.title || 'Scripture Recitation'}
          </Text>

          <View className="mt-2.5 bg-[#D4AF37]/15 border border-[#D4AF37]/40 px-4 py-1.5 rounded-full flex-row items-center shadow-sm">
            <Sparkles size={12} color="#D4AF37" style={{ marginRight: 6 }} />
            <Text className="text-[10px] font-extrabold text-[#D4AF37] uppercase tracking-wider font-inter">
              {selectedMantra?.deity || 'Brahmpath'} • {selectedMantra?.category || 'Audiobooks'}
            </Text>
          </View>
        </View>

        {/* Divider Ornament */}
        <DividerDecoration style={{ marginVertical: 6 }} />

        {/* Timeline Slider */}
        <View className="px-8 mt-1">
          <Pressable
            onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
            onPress={handleProgressBarPress}
            className="h-8 justify-center"
          >
            <View className="h-2 w-full bg-white/15 rounded-full overflow-hidden">
              <View
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-[#D4AF37] rounded-full"
              />
            </View>
            <View
              style={{
                position: 'absolute',
                left: `${progressPercent}%`,
                marginLeft: -8,
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: '#FAF7F2',
                borderWidth: 3,
                borderColor: '#D4AF37',
                shadowColor: '#D4AF37',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.6,
                shadowRadius: 4,
                elevation: 6,
              }}
            />
          </Pressable>

          <View className="flex-row justify-between items-center -mt-1 px-1">
            <Text className="text-[11px] font-bold text-[#C8B88A] font-inter">
              {formatTime(position)}
            </Text>
            <Text className="text-[11px] font-bold text-[#C8B88A] font-inter">
              {formatTime(duration)}
            </Text>
          </View>
        </View>

        {/* Playback Controls */}
        <View className="flex-row justify-center items-center space-x-7 my-3">
          <Pressable
            onPress={previous}
            style={{ width: 48, height: 48, borderRadius: 24 }}
            className="bg-white/10 border border-white/20 items-center justify-center active:scale-90 shadow-sm"
          >
            <SkipBack size={20} color="#FAF7F2" fill="#FAF7F2" />
          </Pressable>

          <Pressable
            onPress={togglePlayPause}
            style={{
              width: 68,
              height: 68,
              borderRadius: 34,
              shadowColor: '#D4AF37',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.45,
              shadowRadius: 12,
              elevation: 8,
            }}
            className="bg-[#7A1E1E] border-2 border-[#D4AF37] items-center justify-center active:scale-95"
          >
            {isPlaying ? (
              <Pause size={28} color="#D4AF37" fill="#D4AF37" />
            ) : (
              <Play size={28} color="#D4AF37" fill="#D4AF37" style={{ marginLeft: 3 }} />
            )}
          </Pressable>

          <Pressable
            onPress={next}
            style={{ width: 48, height: 48, borderRadius: 24 }}
            className="bg-white/10 border border-white/20 items-center justify-center active:scale-90 shadow-sm"
          >
            <SkipForward size={20} color="#FAF7F2" fill="#FAF7F2" />
          </Pressable>
        </View>

        {/* Quick Settings Parameter Controls Bar */}
        <View className="flex-row justify-around items-center bg-[#1A1412]/90 border border-[#D4AF37]/30 rounded-[24px] mx-6 p-3.5 shadow-md">
          <Pressable onPress={() => setShowSpeedSheet(true)} className="items-center flex-1 py-1">
            <Gauge size={19} color="#D4AF37" />
            <Text className="text-[10px] font-extrabold text-[#FAF7F2] mt-1.5 uppercase font-inter text-center tracking-wide">
              {playbackSpeed}x Speed
            </Text>
          </Pressable>

          <Pressable onPress={() => setShowEqSheet(true)} className="items-center flex-1 py-1 border-x border-white/10">
            <SlidersHorizontal size={19} color="#D4AF37" />
            <Text className="text-[10px] font-extrabold text-[#FAF7F2] mt-1.5 uppercase font-inter text-center tracking-wide">
              {eqPreset === 'flat' ? 'EQ Flat' : `${eqPreset}`}
            </Text>
          </Pressable>

          <Pressable onPress={() => setShowRepeatSheet(true)} className="items-center flex-1 py-1 border-r border-white/10">
            <Repeat size={19} color="#D4AF37" />
            <Text className="text-[10px] font-extrabold text-[#FAF7F2] mt-1.5 uppercase font-inter text-center tracking-wide">
              Repeat: {getRepeatTargetLabel(repeatTarget)}
            </Text>
          </Pressable>

          <Pressable onPress={() => setShowTimerSheet(true)} className="items-center flex-1 py-1">
            <Clock size={19} color="#D4AF37" />
            <Text className="text-[10px] font-extrabold text-[#FAF7F2] mt-1.5 uppercase font-inter text-center tracking-wide">
              {sleepTimerLeft > 0 ? `${Math.ceil(sleepTimerLeft / 60)}m left` : 'Timer Off'}
            </Text>
          </Pressable>
        </View>

        {/* Download & Share Action Buttons */}
        <View className="flex-row justify-center items-center space-x-3 px-6 mt-3">
          <Pressable
            onPress={() => selectedMantra && toggleChapterDownload(selectedMantra.id)}
            className="flex-1 flex-row items-center justify-center bg-[#1A1412]/80 border border-[#D4AF37]/35 py-3.5 px-4 rounded-2xl active:scale-95 shadow-sm"
          >
            <Download size={16} color="#D4AF37" style={{ marginRight: 8 }} />
            <Text className="text-xs font-extrabold text-[#FAF7F2] uppercase font-inter tracking-wider">
              {selectedMantra && isChapterDownloaded(selectedMantra.id) ? 'Downloaded' : 'Download'}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleShare}
            className="flex-1 flex-row items-center justify-center bg-[#1A1412]/80 border border-[#D4AF37]/35 py-3.5 px-4 rounded-2xl active:scale-95 shadow-sm"
          >
            <Share2 size={16} color="#D4AF37" style={{ marginRight: 8 }} />
            <Text className="text-xs font-extrabold text-[#FAF7F2] uppercase font-inter tracking-wider">
              Share Chant
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* 1. Playback Speed Adjuster Bottom Sheet */}
      <Modal visible={showSpeedSheet} transparent animationType="fade">
        <Pressable onPress={() => setShowSpeedSheet(false)} className="flex-1 bg-black/80 justify-end">
          <Pressable className="bg-[#1C1513] rounded-t-[32px] border-t-2 border-[#D4AF37] p-6 pb-10 shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-lg font-black text-[#D4AF37] font-inter uppercase tracking-wider">Playback Speed</Text>
              <Pressable onPress={() => setShowSpeedSheet(false)} className="p-1.5 bg-white/10 rounded-full">
                <X size={18} color="#FAF7F2" />
              </Pressable>
            </View>
            
            <View className="flex-row flex-wrap justify-between">
              {SPEED_OPTIONS.map((speed) => (
                <Pressable
                  key={speed}
                  onPress={() => {
                    setPlaybackSpeed(speed);
                    setShowSpeedSheet(false);
                  }}
                  className={`w-[48%] p-4 rounded-2xl border mb-3 items-center justify-center ${
                    playbackSpeed === speed
                      ? 'bg-[#7A1E1E] border-[#D4AF37]'
                      : 'bg-[#2A201D] border-white/10'
                  }`}
                >
                  <Text className={`text-xs font-extrabold font-inter ${playbackSpeed === speed ? 'text-[#D4AF37]' : 'text-[#FAF7F2]'}`}>
                    {speed === 1.0 ? 'Normal (1.0x)' : `${speed}x`}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 2. Equalizer Sheet */}
      <Modal visible={showEqSheet} transparent animationType="fade">
        <Pressable onPress={() => setShowEqSheet(false)} className="flex-1 bg-black/80 justify-end">
          <Pressable className="bg-[#1C1513] rounded-t-[32px] border-t-2 border-[#D4AF37] p-6 pb-10 shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-lg font-black text-[#D4AF37] font-inter uppercase tracking-wider">Acoustic Equalizer</Text>
              <Pressable onPress={() => setShowEqSheet(false)} className="p-1.5 bg-white/10 rounded-full">
                <X size={18} color="#FAF7F2" />
              </Pressable>
            </View>

            {/* Presets Chips */}
            <View className="flex-row justify-between mb-8">
              {['flat', 'meditation', 'vocal', 'temple'].map((preset) => (
                <Pressable
                  key={preset}
                  onPress={() => handlePresetSelect(preset)}
                  className={`px-3.5 py-2 rounded-full border ${
                    eqPreset === preset
                      ? 'bg-[#7A1E1E] border-[#D4AF37]'
                      : 'bg-[#2A201D] border-white/10'
                  }`}
                >
                  <Text className={`text-[10px] font-extrabold uppercase tracking-wider font-inter ${eqPreset === preset ? 'text-[#D4AF37]' : 'text-neutral-400'}`}>
                    {preset}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Simulated 5 Frequency Slider bars */}
            <View className="flex-row justify-around h-32 items-end mb-6 px-4">
              {eqBands.map((band, idx) => {
                const freqs = ['60Hz', '230Hz', '900Hz', '4kHz', '14kHz'];
                return (
                  <View key={idx} className="items-center h-full justify-end">
                    {/* Vertical slide track */}
                    <View className="w-2 h-24 bg-white/10 rounded-full justify-end relative overflow-visible">
                      <View
                        style={{ height: `${band}%` }}
                        className="w-full bg-[#D4AF37] rounded-full"
                      />
                      {/* Knob thumb */}
                      <View
                        style={{ bottom: `${band}%`, marginBottom: -6, left: -4 }}
                        className="w-4 h-4 rounded-full bg-[#FAF7F2] border-2 border-[#D4AF37] absolute shadow-sm"
                      />
                    </View>
                    <Text className="text-[9px] font-extrabold text-[#C8B88A] mt-2 font-inter">
                      {freqs[idx]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 3. Sleep Timer presets Sheet */}
      <Modal visible={showTimerSheet} transparent animationType="fade">
        <Pressable onPress={() => setShowTimerSheet(false)} className="flex-1 bg-black/80 justify-end">
          <Pressable className="bg-[#1C1513] rounded-t-[32px] border-t-2 border-[#D4AF37] p-6 pb-10 shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-lg font-black text-[#D4AF37] font-inter uppercase tracking-wider">Sleep Timer</Text>
              <Pressable onPress={() => setShowTimerSheet(false)} className="p-1.5 bg-white/10 rounded-full">
                <X size={18} color="#FAF7F2" />
              </Pressable>
            </View>

            <View className="flex-row flex-wrap justify-between">
              {[0, 15, 30, 45, 60].map((mins) => {
                const isActive = mins === 0 ? sleepTimerLeft === 0 : Math.ceil(sleepTimerLeft / 60) === mins;
                return (
                  <Pressable
                    key={mins}
                    onPress={() => {
                      if (mins === 0) {
                        stopSleepTimer();
                      } else {
                        startSleepTimer(mins);
                      }
                      setShowTimerSheet(false);
                    }}
                    className={`w-[48%] p-4 rounded-2xl border mb-3 items-center justify-center ${
                      isActive
                        ? 'bg-[#7A1E1E] border-[#D4AF37]'
                        : 'bg-[#2A201D] border-white/10'
                    }`}
                  >
                    <Text className={`text-xs font-extrabold font-inter ${isActive ? 'text-[#D4AF37]' : 'text-[#FAF7F2]'}`}>
                      {mins === 0 ? 'Timer Inactive' : `${mins} minutes`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 4. Repetition Counts Target Selector Sheet */}
      <Modal visible={showRepeatSheet} transparent animationType="fade">
        <Pressable onPress={() => setShowRepeatSheet(false)} className="flex-1 bg-black/80 justify-end">
          <Pressable className="bg-[#1C1513] rounded-t-[32px] border-t-2 border-[#D4AF37] p-6 pb-10 shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-lg font-black text-[#D4AF37] font-inter uppercase tracking-wider">Target Repetitions</Text>
              <Pressable onPress={() => setShowRepeatSheet(false)} className="p-1.5 bg-white/10 rounded-full">
                <X size={18} color="#FAF7F2" />
              </Pressable>
            </View>

            <View className="flex-row flex-wrap justify-between">
              {REPEAT_TARGETS.map((target) => {
                const isActive = repeatTarget === target;
                const label = target === -1 ? 'Loop Infinitely' : `${target} Times`;
                
                return (
                  <Pressable
                    key={target}
                    onPress={() => {
                      setRepeatTarget(target);
                      resetRepeatCount();
                      setShowRepeatSheet(false);
                    }}
                    className={`w-[48%] p-4 rounded-2xl border mb-3 items-center justify-center ${
                      isActive
                        ? 'bg-[#7A1E1E] border-[#D4AF37]'
                        : 'bg-[#2A201D] border-white/10'
                    }`}
                  >
                    <Text className={`text-xs font-extrabold font-inter ${isActive ? 'text-[#D4AF37]' : 'text-[#FAF7F2]'}`}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
});

export default MantraDetailsScreen;
