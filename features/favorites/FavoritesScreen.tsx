import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Play, Heart } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useFavoritesStore } from '../../store/favoritesStore';
import { usePlayerStore } from '../../store/playerStore';
import { MantraCard } from '../../components/MantraCard';
import { MANTRAS, Mantra } from '../../utils/mantraData';
import { blurActiveElement } from '../../utils/blurActiveElement';

export const FavoritesScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  
  const playMantra = usePlayerStore(state => state.playMantra);
  const currentMantra = usePlayerStore(state => state.currentMantra);
  const favorites = useFavoritesStore(state => state.favorites);

  // Map IDs to Mantra records
  const favoriteMantras = favorites
    .map(id => MANTRAS.find(m => m.id === id))
    .filter((m): m is Mantra => !!m);

  const handleMantraPress = (mantra: Mantra) => {
    blurActiveElement();
    playMantra(mantra);
    navigation.navigate('MantraDetails', { mantraId: mantra.id });
  };

  const handlePlayAll = () => {
    if (favoriteMantras.length > 0) {
      handleMantraPress(favoriteMantras[0]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-spiritual-sand dark:bg-spiritual-cosmic">
      {/* Top Header */}
      <View className="flex-row items-center px-5 py-4">
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
          My Favorites
        </Text>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-5" style={{ paddingBottom: currentMantra ? 120 : 20 }}>
        {favoriteMantras.length > 0 ? (
          <>
            {/* Play All Header Banner */}
            <TouchableOpacity
              onPress={handlePlayAll}
              className="flex-row items-center bg-spiritual-saffron/10 dark:bg-spiritual-saffron/20 border border-spiritual-saffron/20 py-3.5 px-5 rounded-2xl mb-5 shadow-sm active:scale-[0.99]"
            >
              <View className="w-9 h-9 rounded-full bg-spiritual-saffron items-center justify-center shadow-sm">
                <Play size={16} color="white" fill="white" className="ml-0.5" />
              </View>
              <View className="ml-4">
                <Text className="text-sm font-bold text-spiritual-charcoal dark:text-white">
                  Play Favorites
                </Text>
                <Text className="text-xs text-neutral-400 font-medium">
                  {favoriteMantras.length} devotional chants ready
                </Text>
              </View>
            </TouchableOpacity>

            {/* List */}
            <FlatList
              data={favoriteMantras}
              keyExtractor={item => `fav-${item.id}`}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <MantraCard
                  mantra={item}
                  variant="row"
                  onPress={() => handleMantraPress(item)}
                />
              )}
            />
          </>
        ) : (
          /* Empty State Illustration */
          <View className="flex-1 items-center justify-center px-8 pb-12">
            <View className="w-20 h-20 bg-neutral-100 dark:bg-spiritual-surfaceDark rounded-full items-center justify-center mb-5 border border-gray-100 dark:border-neutral-800">
              <Heart size={32} color="#EF4444" fill="#EF4444" />
            </View>
            <Text className="text-lg font-bold text-spiritual-charcoal dark:text-white text-center">
              Your Sanctuary is Empty
            </Text>
            <Text className="text-sm text-neutral-400 text-center mt-2 leading-relaxed font-medium">
              Create a personalized list of spiritual chants by clicking the heart button on any mantra card.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};
export default FavoritesScreen;
