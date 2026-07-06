import React from 'react';
import { View, Text, Image, Pressable, TouchableOpacity } from 'react-native';
import { Play, Heart } from 'lucide-react-native';
import { Mantra } from '../utils/mantraData';
import { useFavoritesStore } from '../store/favoritesStore';
import { useTheme } from '../hooks/useTheme';
import { formatTime } from '../utils/formatTime';
import { blurActiveElement } from '../utils/blurActiveElement';

interface MantraCardProps {
  mantra: Mantra;
  onPress: () => void;
  variant?: 'grid' | 'row';
}

export const MantraCard: React.FC<MantraCardProps> = ({
  mantra,
  onPress,
  variant = 'row'
}) => {
  const { colors } = useTheme();
  const toggleFavorite = useFavoritesStore(state => state.toggleFavorite);
  const isFav = useFavoritesStore(state => state.isFavorite(mantra.id));

  const handleFavoritePress = (e: any) => {
    e.stopPropagation(); // Prevent card tap triggering playback
    blurActiveElement();
    toggleFavorite(mantra.id);
  };

  const handlePress = () => {
    blurActiveElement();
    onPress();
  };

  if (variant === 'grid') {
    return (
      <Pressable
        onPress={handlePress}
        style={{ width: 192, height: 240 }}
        className="bg-white dark:bg-spiritual-surfaceDark rounded-3xl p-3 mr-4 shadow-sm border border-gray-50 dark:border-neutral-900 active:scale-[0.98] transition-all duration-200"
      >
        {/* Artwork */}
        <View 
          style={{ height: 144 }}
          className="relative w-full rounded-2xl overflow-hidden shadow-sm"
        >
          <Image
            source={mantra.cover}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
          
          {/* Saffron Overlay on hover/press */}
          <View className="absolute inset-0 bg-black/10 flex items-center justify-center">
            <View className="w-10 h-10 rounded-full bg-white/95 items-center justify-center shadow">
              <Play size={16} color="#FF9933" fill="#FF9933" className="ml-0.5" />
            </View>
          </View>

          {/* Deity Badge */}
          <View className="absolute bottom-2 left-2 bg-black/45 px-2.5 py-1 rounded-full">
            <Text className="text-[10px] text-white font-semibold uppercase tracking-widest">
              {mantra.deity}
            </Text>
          </View>
        </View>

        {/* Text */}
        <View className="mt-3 px-1">
          <Text
            numberOfLines={1}
            className="text-sm font-bold text-spiritual-charcoal dark:text-white"
          >
            {mantra.title}
          </Text>
          
          <View className="flex-row justify-between items-center mt-1">
            <Text className="text-xs text-neutral-400 font-medium">
              {mantra.category} • {formatTime(mantra.duration)}
            </Text>
            
            <TouchableOpacity onPress={handleFavoritePress} className="p-1">
              <Heart
                size={16}
                color={isFav ? '#EF4444' : '#9CA3AF'}
                fill={isFav ? '#EF4444' : 'transparent'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    );
  }

  // Row List view
  return (
    <Pressable
      onPress={handlePress}
      className="flex-row items-center bg-white dark:bg-spiritual-surfaceDark p-3 rounded-2xl mb-3 shadow-sm border border-gray-50/50 dark:border-neutral-900/50 active:scale-[0.99] transition-all duration-150"
    >
      {/* Cover Image */}
      <View 
        style={{ width: 56, height: 56 }}
        className="rounded-xl overflow-hidden shadow-sm mr-4 relative bg-gray-100"
      >
        <Image
          source={mantra.cover}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black/10 items-center justify-center">
          <Play size={12} color="white" fill="white" className="ml-0.5" />
        </View>
      </View>

      {/* Track Info */}
      <View className="flex-1">
        <Text
          numberOfLines={1}
          className="text-sm font-bold text-spiritual-charcoal dark:text-white"
        >
          {mantra.title}
        </Text>
        <Text
          numberOfLines={1}
          className="text-xs text-neutral-400 dark:text-neutral-400 mt-0.5 font-medium"
        >
          {mantra.deity} • {mantra.category}
        </Text>
      </View>

      {/* Right control buttons */}
      <View className="flex-row items-center space-x-3">
        <Text className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">
          {formatTime(mantra.duration)}
        </Text>
        <TouchableOpacity onPress={handleFavoritePress} className="p-2">
          <Heart
            size={18}
            color={isFav ? '#EF4444' : '#9CA3AF'}
            fill={isFav ? '#EF4444' : 'transparent'}
          />
        </TouchableOpacity>
      </View>
    </Pressable>
  );
};
export default MantraCard;
