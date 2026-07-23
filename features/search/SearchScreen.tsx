import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Image, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Search, Mic, ArrowLeft, X, BookOpen, Clock, Heart, ChevronRight } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { BOOKS, MANTRAS, Book, Mantra } from '../../utils/mantraData';
import { ScriptureCard, EmptyState } from '../../components/ui/DesignSystem';
import { usePlayerStore } from '../../store/playerStore';
import { apiService, BookData, MantraData } from '../../services/api/apiService';

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'books' | 'mantras'>('all');
  const [recentSearches, setRecentSearches] = useState(['Bhagavad Gita', 'Gayatri', 'Peace']);
  const [voiceActive, setVoiceActive] = useState(false);

  const { playMantra, currentMantra } = usePlayerStore();
  const voicePulse = useSharedValue(1);

  // API Search State
  const [matchingBooks, setMatchingBooks] = useState<any[]>([]);
  const [matchingMantras, setMatchingMantras] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim().length > 0) {
        searchCatalog();
      } else {
        setMatchingBooks([]);
        setMatchingMantras([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const searchCatalog = async () => {
    setLoading(true);
    setIsOffline(false);
    try {
      // 1. Search books dynamically via API
      const liveBooks = await apiService.library.getBooks({ search: query });
      const formattedBooks = liveBooks.map((b: BookData) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        language: b.language,
        cover: { uri: b.cover_image },
        description: b.description,
        chaptersCount: 18,
        estimatedReadingTime: `${Math.floor(b.estimated_duration / 60)} mins`,
        category: b.category_name,
        isPremium: b.is_premium
      }));

      // 2. Search mantras dynamically via API (multi-language text match selector)
      const liveMantras = await apiService.library.searchAllMantras(query);
      const formattedMantras = liveMantras.map((m: MantraData) => ({
        id: m.id,
        title: m.title,
        deity: m.gujarati_text || 'Devotional',
        cover: m.audio?.audio_file_url ? { uri: m.audio.audio_file_url } : require('../../assets/images/shivatandava.png'),
        duration: m.audio?.duration || 120,
        audio: m.audio?.audio_file_url || m.audio?.audio_file,
        lyrics: {
          id: m.id,
          title: m.title,
          verses: [
            { start: 0, end: m.audio?.duration || 120, text: m.sanskrit_text, translation: m.english_text }
          ]
        }
      }));

      setMatchingBooks(formattedBooks);
      setMatchingMantras(formattedMantras);
    } catch (e) {
      console.warn('API connection failed during search, performing offline search fallback', e);
      setIsOffline(true);
      
      // Fallback offline search on local mock dataset
      const localBooks = BOOKS.filter(b => 
        b.title.toLowerCase().includes(query.toLowerCase()) || 
        b.author.toLowerCase().includes(query.toLowerCase())
      );
      const localMantras = MANTRAS.filter(m => 
        m.title.toLowerCase().includes(query.toLowerCase()) || 
        m.deity.toLowerCase().includes(query.toLowerCase())
      );
      
      setMatchingBooks(localBooks);
      setMatchingMantras(localMantras);
    } finally {
      setLoading(false);
    }
  };

  const handleVoicePress = () => {
    setVoiceActive(true);
    voicePulse.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 500 }),
        withTiming(1.0, { duration: 500 })
      ),
      -1,
      true
    );

    // Simulate voice speech transcription
    setTimeout(() => {
      setQuery('Bhagavad Gita');
      setVoiceActive(false);
    }, 2500);
  };

  const handleMantraPress = (mantra: Mantra) => {
    playMantra(mantra);
    navigation.navigate('MantraDetails', { mantraId: mantra.id });
  };

  const handleBookPress = (book: Book) => {
    navigation.navigate('PDFViewer', { bookId: book.id, title: book.title, offline: isOffline });
  };

  const clearRecentSearch = (searchItem: string) => {
    setRecentSearches(recentSearches.filter((x) => x !== searchItem));
  };

  const hasResults = matchingBooks.length > 0 || matchingMantras.length > 0;

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: voicePulse.value }],
    opacity: 2 - voicePulse.value,
  }));

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2] dark:bg-[#120E0D]">
      {/* Search Header Bar */}
      <View className="flex-row items-center px-4 py-3 border-b border-[#E6DFD3] dark:border-[#2D221F] bg-white dark:bg-[#1C1513]">
        <Pressable onPress={() => navigation.goBack()} className="p-1 rounded-full active:bg-[#E6DFD3]/40">
          <ArrowLeft size={22} color="#7A1E1E" />
        </Pressable>

        <View className="flex-row flex-1 items-center bg-[#FAF7F2] dark:bg-[#2A1E1C] border border-[#E6DFD3] dark:border-[#3D2C28] rounded-xl px-3 py-1.5 ml-3">
          <Search size={16} color="#8C7A6B" />
          <TextInput
            placeholder="Search books, verses, deities..."
            placeholderTextColor="#8C7A6B"
            className="flex-1 ml-2 text-sm text-[#3A2E2B] dark:text-neutral-200 py-0.5 font-inter"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} className="p-0.5 bg-[#7A1E1E]/5 rounded-full">
              <X size={14} color="#7A1E1E" />
            </Pressable>
          ) : (
            <Pressable onPress={handleVoicePress} className="p-1">
              <Mic size={16} color="#7A1E1E" />
            </Pressable>
          )}
        </View>
        {isOffline && (
          <View className="ml-2 bg-neutral-200 dark:bg-neutral-800 px-2 py-1 rounded-full">
            <Text className="text-[8px] font-bold text-neutral-500 font-inter">Offline</Text>
          </View>
        )}
      </View>

      {/* Main Container */}
      {query.length === 0 ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View className="mb-6">
              <Text className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3 font-inter">
                Recent Searches
              </Text>
              <View className="flex-row flex-wrap">
                {recentSearches.map((item) => (
                  <View
                    key={item}
                    className="flex-row items-center bg-[#E6DFD3]/30 dark:bg-[#2D221F]/40 border border-[#E6DFD3]/60 dark:border-[#3A2A25] rounded-full px-3.5 py-1.5 mr-2.5 mb-2.5"
                  >
                    <Pressable onPress={() => setQuery(item)}>
                      <Text className="text-xs text-[#3A2E2B] dark:text-neutral-300 font-inter">{item}</Text>
                    </Pressable>
                    <Pressable onPress={() => clearRecentSearch(item)} className="ml-2">
                      <X size={12} color="#8C7A6B" />
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Popular Searches */}
          <View className="mb-8">
            <Text className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3 font-inter">
              Popular searches
            </Text>
            <View className="flex-row flex-wrap">
              {['Gita Shloka', 'Gayatri Mantra', 'Rigveda', 'Lord Shiva', 'Morning Chants'].map((tag) => (
                <Pressable
                  key={tag}
                  onPress={() => setQuery(tag)}
                  className="bg-transparent border border-[#E6DFD3] dark:border-[#3A2A25] rounded-full px-4 py-2 mr-2.5 mb-2.5 active:bg-[#7A1E1E]/5"
                >
                  <Text className="text-xs text-[#7A1E1E] dark:text-[#E6DFD3] font-semibold font-inter">
                    {tag}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        /* Results View */
        <View className="flex-1">
          {/* Tab Filter bar */}
          <View className="flex-row border-b border-[#E6DFD3] dark:border-[#2D221F] px-4 bg-white dark:bg-[#1C1513]">
            {(['all', 'books', 'mantras'] as const).map((tab) => {
              const active = activeTab === tab;
              const label = { all: 'All Results', books: 'Scriptures', mantras: 'Devotional Chants' }[tab];
              
              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  className="pb-3.5 pt-2 mr-6 relative"
                >
                  <Text className={`text-xs font-bold font-inter ${active ? 'text-[#7A1E1E] dark:text-[#FAF7F2]' : 'text-neutral-400'}`}>
                    {label}
                  </Text>
                  {active && (
                    <View className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7A1E1E]" />
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Results scrolling list */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 20, paddingBottom: currentMantra ? 180 : 100 }}
          >
            {loading ? (
              <View className="py-20">
                <ActivityIndicator size="large" color="#7A1E1E" />
              </View>
            ) : !hasResults ? (
              <EmptyState
                title="No Matches Found"
                message="Double check your spelling or search by deity name (e.g. Shiva, Savitr)."
              />
            ) : (
              <View className="space-y-6">
                {/* 1. Books / Scriptures results */}
                {(activeTab === 'all' || activeTab === 'books') && matchingBooks.length > 0 && (
                  <View className="space-y-3">
                    <Text className="text-xs font-bold text-neutral-400 uppercase tracking-widest font-inter mb-1">
                      Scriptures ({matchingBooks.length})
                    </Text>
                    {matchingBooks.map((book) => (
                      <ScriptureCard key={book.id} onPress={() => handleBookPress(book)} style={{ padding: 12 }}>
                        <View className="flex-row items-center">
                          <BookOpen size={20} color="#7A1E1E" />
                          <View className="flex-1 ml-3.5">
                            <Text className="text-sm font-bold text-[#3A2E2B] dark:text-[#E6DFD3] font-inter">
                              {book.title}
                            </Text>
                            <Text className="text-[10px] text-neutral-500 font-inter">
                              By {book.author}
                            </Text>
                          </View>
                          <ChevronRight size={16} color="#8C7A6B" />
                        </View>
                      </ScriptureCard>
                    ))}
                  </View>
                )}

                {/* 2. Mantras / Chants results */}
                {(activeTab === 'all' || activeTab === 'mantras') && matchingMantras.length > 0 && (
                  <View className="space-y-3">
                    <Text className="text-xs font-bold text-neutral-400 uppercase tracking-widest font-inter mb-1">
                      Devotional Chants ({matchingMantras.length})
                    </Text>
                    {matchingMantras.map((mantra) => (
                      <ScriptureCard key={mantra.id} onPress={() => handleMantraPress(mantra)} style={{ padding: 12 }}>
                        <View className="flex-row items-center">
                          <Image source={mantra.cover} style={{ width: 36, height: 36, borderRadius: 8 }} className="bg-neutral-100 mr-3" />
                          <View className="flex-1">
                            <Text className="text-sm font-bold text-[#3A2E2B] dark:text-[#E6DFD3] font-inter">
                              {mantra.title}
                            </Text>
                            <Text className="text-[10px] text-neutral-500 font-inter">
                              Deity: {mantra.deity} • {Math.floor(mantra.duration)}s
                            </Text>
                          </View>
                          <ChevronRight size={16} color="#8C7A6B" />
                        </View>
                      </ScriptureCard>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* Voice Search Overlay Screen */}
      {voiceActive && (
        <Modal visible={voiceActive} transparent animationType="fade">
          <View className="flex-1 bg-black/85 items-center justify-center p-6">
            <View className="items-center">
              <View className="relative w-28 h-28 items-center justify-center mb-10">
                {/* Radial animated waves */}
                <Animated.View
                  style={pulseStyle}
                  className="absolute w-full h-full rounded-full bg-[#7A1E1E]/40 border border-[#D4AF37]"
                />
                <View className="w-20 h-20 rounded-full bg-[#7A1E1E] border-2 border-[#D4AF37] items-center justify-center shadow-lg">
                  <Mic size={32} color="#FAF7F2" />
                </View>
              </View>

              <Text className="text-lg font-bold text-white text-center font-inter mb-2">
                Listening to Chants...
              </Text>
              <Text className="text-sm text-neutral-400 text-center font-inter max-w-[240px]">
                Speak the name of a scripture like "Gita" or a deity name like "Shiva".
              </Text>

              <Pressable
                onPress={() => setVoiceActive(false)}
                className="mt-16 bg-white/10 border border-white/20 px-6 py-3 rounded-full active:bg-white/20"
              >
                <Text className="text-xs font-bold text-white font-inter">Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default SearchScreen;
