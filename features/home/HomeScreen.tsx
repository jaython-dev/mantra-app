import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { Header } from '../../components/Header';
import { CategoryChip } from '../../components/CategoryChip';
import { MantraCard } from '../../components/MantraCard';
import { usePlayerStore } from '../../store/playerStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import { MANTRAS, CATEGORIES, Mantra } from '../../utils/mantraData';
import { blurActiveElement } from '../../utils/blurActiveElement';

export const HomeScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const playMantra = usePlayerStore(state => state.playMantra);
  const currentMantra = usePlayerStore(state => state.currentMantra);
  
  const { recentlyPlayed, fetchFavorites, fetchHistory } = useFavoritesStore();

  useEffect(() => {
    // Initial data fetch from SQLite
    fetchFavorites();
    fetchHistory();
  }, []);

  const handleMantraPress = (mantra: Mantra) => {
    playMantra(mantra);
    navigation.navigate('MantraDetails', { mantraId: mantra.id });
  };

  // Filter logic based on Category and Search Query
  const getFilteredMantras = () => {
    return MANTRAS.filter(mantra => {
      const matchesSearch =
        mantra.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mantra.deity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mantra.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mantra.language.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory =
        selectedCategory === 'All' || mantra.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  };

  const filteredMantras = getFilteredMantras();
  const featuredMantras = MANTRAS.slice(0, 3); // Seed first 3 as featured
  const popularMantras = MANTRAS.slice(2, 5); // Seed middle 3 as popular

  // Map recentlyPlayed ID keys back to Mantra objects
  const recentPlayedList = recentlyPlayed
    .map(id => MANTRAS.find(m => m.id === id))
    .filter((m): m is Mantra => !!m);

  return (
    <SafeAreaView className="flex-1 bg-spiritual-sand dark:bg-spiritual-cosmic">
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <ScrollView
        key={`${selectedCategory}-${searchQuery}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: currentMantra ? 186 : 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* App Greeting & Header Search */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onFavoritesPress={() => {
            blurActiveElement();
            navigation.navigate('Favorites');
          }}
        />

        {/* Categories Chips */}
        <View className="mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            {CATEGORIES.map(category => (
              <CategoryChip
                key={category}
                title={category}
                active={selectedCategory === category}
                onPress={() => {
                  setSelectedCategory(category);
                }}
              />
            ))}
          </ScrollView>
        </View>

        {/* Dynamic Search Results Screen overlay */}
        {searchQuery.length > 0 || selectedCategory !== 'All' ? (
          <View className="px-5">
            <Text className="text-lg font-bold text-spiritual-charcoal dark:text-white mb-4">
              Found {filteredMantras.length} Mantra{filteredMantras.length === 1 ? '' : 's'}
            </Text>
            {filteredMantras.length === 0 ? (
              <View className="items-center py-12">
                <Text className="text-sm text-neutral-400 text-center font-medium">
                  No mantras match your filters. Try search terms like 'Shiva' or 'Morning'.
                </Text>
              </View>
            ) : (
              filteredMantras.map(mantra => (
                <MantraCard
                  key={mantra.id}
                  mantra={mantra}
                  variant="row"
                  onPress={() => handleMantraPress(mantra)}
                />
              ))
            )}
          </View>
        ) : (
          /* Default Screen layout */
          <View>
            {/* Continue Listening / Recent Playback */}
            {recentPlayedList.length > 0 && (
              <View className="mb-6 px-5">
                <Text className="text-lg font-bold text-spiritual-charcoal dark:text-white mb-3">
                  Recently Listened
                </Text>
                <FlatList
                  data={recentPlayedList.slice(0, 3)}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={item => `recent-${item.id}`}
                  renderItem={({ item }) => (
                    <MantraCard
                      mantra={item}
                      variant="grid"
                      onPress={() => handleMantraPress(item)}
                    />
                  )}
                />
              </View>
            )}

            {/* Featured Section */}
            <View className="mb-6 px-5">
              <Text className="text-lg font-bold text-spiritual-charcoal dark:text-white mb-3">
                Featured Mantras
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {featuredMantras.map(item => (
                  <MantraCard
                    key={`feat-${item.id}`}
                    mantra={item}
                    variant="grid"
                    onPress={() => handleMantraPress(item)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Popular Section */}
            <View className="px-5 mb-4">
              <Text className="text-lg font-bold text-spiritual-charcoal dark:text-white mb-3">
                Popular Mantras
              </Text>
              {popularMantras.map(item => (
                <MantraCard
                  key={`pop-${item.id}`}
                  mantra={item}
                  variant="row"
                  onPress={() => handleMantraPress(item)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
export default HomeScreen;
