import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Search, BookOpen, Clock, Heart, Play, ChevronRight, Menu, Bell } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useFavoritesStore } from '../../store/favoritesStore';
import { usePlayerStore } from '../../store/playerStore';
import { BOOKS, MANTRAS, Book, Mantra } from '../../utils/mantraData';
import { ScriptureCard, DividerDecoration } from '../../components/ui/DesignSystem';
import { apiService, BookData, MantraData } from '../../services/api/apiService';
import { Skeleton, BookCardSkeleton } from '../../components/ui/Skeleton';

export const HomeScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<any>();
  const [greeting, setGreeting] = useState('Hari Om');
  const [greetingSub, setGreetingSub] = useState('Welcome to your spiritual sanctuary');

  const { recentlyPlayed, activeBookProgress, lastReadBookId, fetchFavorites, fetchHistory } = useFavoritesStore();
  const { playMantra, currentMantra } = usePlayerStore();

  const [featuredBooks, setFeaturedBooks] = useState<any[]>([]);
  const [popularMantras, setPopularMantras] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    fetchFavorites();
    fetchHistory();
    determineGreeting();
    loadHomeContent();
  }, []);

  const determineGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) {
      setGreeting('Shubh Prabhāt');
      setGreetingSub('Prātah smarāmi — A blessed morning of dhyāna');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Hari Om');
      setGreetingSub('May your afternoon be filled with mindfulness');
    } else if (hour >= 17 && hour < 22) {
      setGreeting('Shubh Sandhyā');
      setGreetingSub('Chant under the evening light for inner peace');
    } else {
      setGreeting('Hari Om');
      setGreetingSub('A calm night for sacred listening');
    }
  };

  const loadHomeContent = async () => {
    setLoading(true);
    setIsOffline(false);
    try {
      // 1. Fetch featured books from live API
      const liveBooks = await apiService.library.getBooks();
      const formattedBooks = liveBooks.slice(0, 3).map((b: BookData) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        language: b.language,
        cover: { uri: b.cover_image },
        description: b.description,
        chaptersCount: b.chapters_count || 3,
        mantrasCount: b.mantras_count || 36,
        estimatedReadingTime: `${Math.floor(b.estimated_duration / 60)} hrs`,
        category: b.category_name,
        isPremium: b.is_premium
      }));

      // 2. Fetch popular mantras
      const liveMantras = await apiService.library.searchAllMantras('');
      const formattedMantras = liveMantras.slice(0, 3).map((m: MantraData) => ({
        id: m.id,
        title: m.title,
        deity: m.gujarati_text || 'Devotional', // display helper
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

      setFeaturedBooks(formattedBooks.length > 0 ? formattedBooks : BOOKS);
      setPopularMantras(formattedMantras.length > 0 ? formattedMantras : MANTRAS.slice(0, 3));
    } catch (e) {
      console.warn('API connection failed in HomeScreen, using local catalog offline fallbacks', e);
      setIsOffline(true);
      setFeaturedBooks(BOOKS);
      setPopularMantras(MANTRAS.slice(0, 3));
    } finally {
      setLoading(false);
    }
  };

  const handleMantraPress = (mantra: any) => {
    playMantra(mantra);
    navigation.navigate('MantraDetails', { mantraId: mantra.id });
  };

  // Continue Reading progress calculations
  const lastBook = featuredBooks.find((b) => b.id === lastReadBookId) || featuredBooks[0] || BOOKS[0];
  const progress = activeBookProgress[lastBook.id];
  const lastActiveChId = progress?.chapterId || lastBook.chapters?.[0]?.id || '1';
  const lastActiveVerseIdx = progress?.verseIndex || 0;
  
  // Resolve chapter title
  const activeChapterTitle = lastBook.chapters?.find((c: any) => c.id === lastActiveChId)?.title || 'Chapter 1';

  const handleContinueReading = () => {
    navigation.navigate('Reader', {
      bookId: lastBook.id,
      chapterId: lastActiveChId,
      verseIndex: lastActiveVerseIdx,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2] dark:bg-[#120E0D]" edges={['top', 'left', 'right']}>
      {/* Traditional Sanskrit Top AppBar Header */}
      <View className="px-5 h-16 flex-row justify-between items-center bg-[#FAF7F2] dark:bg-[#120E0D] border-b border-[#E6DFD3]/40 dark:border-[#2D221F]/40">
        <Pressable className="p-2 -ml-2 rounded-full active:bg-[#E6DFD3]/40 dark:active:bg-[#2D221F]/40">
          <Menu size={22} color={isDark ? '#E6DFD3' : '#7A1E1E'} />
        </Pressable>
        <Text className="text-base font-bold text-[#7A1E1E] dark:text-[#E6DFD3] tracking-widest font-inter">
          || ॐ नमः शिवाय ||
        </Text>
        <Pressable className="p-2 -mr-2 rounded-full active:bg-[#E6DFD3]/40 dark:active:bg-[#2D221F]/40 relative">
          <Bell size={22} color={isDark ? '#E6DFD3' : '#7A1E1E'} />
          <View className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D12626]" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: currentMantra ? 180 : 40 }}
      >
        {/* Search Bar */}
        <Pressable
          onPress={() => navigation.navigate('Search')}
          className="mx-5 mt-5 flex-row items-center bg-[#E6DFD3]/40 dark:bg-[#2D221F]/60 border border-[#E6DFD3] dark:border-[#3A2A25] rounded-[20px] px-5 py-3.5 mb-5"
        >
          <Search size={18} color="#7A1E1E" />
          <Text className="ml-3 text-sm text-[#8C7A6B] font-medium font-inter">
            Search books, chapters, mantras...
          </Text>
        </Pressable>

        {loading ? (
          <View className="px-5 mt-2">
            {/* Hero Banner Skeleton */}
            <Skeleton width="100%" height={176} borderRadius={24} style={{ marginBottom: 24 }} />
            
            {/* Title Skeleton */}
            <Skeleton width="45%" height={20} borderRadius={4} style={{ marginBottom: 16 }} />
            
            {/* Grid of Book Skeletons */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <BookCardSkeleton />
              <BookCardSkeleton />
              <BookCardSkeleton />
              <BookCardSkeleton />
            </View>
          </View>
        ) : (
          <>
            {/* Lord Shiva Explore Hero Banner */}
            <View className="mx-5 mb-6 overflow-hidden rounded-[24px] bg-[#FAF3E3] dark:bg-[#1E1614] border border-[#E6DFD3] dark:border-[#3A2A25] flex-row h-44 shadow-sm shadow-[#3A2E2B]/5">
              <View className="flex-1 p-5 justify-between">
                <View>
                  <Text className="text-xl font-bold text-[#3A2E2B] dark:text-[#FAF7F2] font-inter">
                    शिवबोधन
                  </Text>
                  <Text className="text-xs text-[#8C7A6B] mt-1 font-inter">
                    संपूर्ण शिव स्तोत्र संग्रह
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    const firstBook = featuredBooks[0] || BOOKS[0];
                    if (firstBook) {
                      navigation.navigate('PDFViewer', { bookId: firstBook.id, title: firstBook.title, offline: isOffline });
                    }
                  }}
                  className="bg-[#D12626] px-5 py-2.5 rounded-full self-start active:scale-95 shadow-sm shadow-[#D12626]/20"
                >
                  <Text className="text-white text-xs font-bold font-inter">
                    Explore Now
                  </Text>
                </Pressable>
              </View>
              <View className="w-2/5 h-full relative">
                <Image
                  source={require('../../assets/images/shiva_vector_banner.png')}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* Continue Study / Listening */}
            <View className="px-5 mb-6">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-xs font-bold text-neutral-400 uppercase tracking-widest font-inter">
                  Continue study
                </Text>
                <Pressable onPress={handleContinueReading} className="flex-row items-center">
                  <Text className="text-[10px] text-[#7A1E1E] dark:text-[#D4AF37] font-bold uppercase tracking-wider font-inter">
                    See All
                  </Text>
                  <ChevronRight size={12} color="#7A1E1E" />
                </Pressable>
              </View>

              <ScriptureCard
                onPress={handleContinueReading}
                style={{ padding: 14 }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1 pr-3">
                    <View className="w-11 h-11 rounded-full bg-[#FAF7F2] dark:bg-[#1C1513] border border-[#E6DFD3] dark:border-[#3A2A25] items-center justify-center mr-3">
                      <BookOpen size={18} color="#7A1E1E" />
                    </View>
                    <View className="flex-1 pr-2">
                      <Text numberOfLines={1} className="text-sm font-bold text-[#3A2E2B] dark:text-[#E6DFD3] font-inter">
                        {lastBook.title}
                      </Text>
                      <Text numberOfLines={1} className="text-xs text-neutral-500 font-inter mt-0.5">
                        {activeChapterTitle} • Verse {lastActiveVerseIdx + 1}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center space-x-2">
                    <View className="w-8 h-8 rounded-full bg-[#FAF7F2] dark:bg-[#1C1513] border border-[#E6DFD3] dark:border-[#3A2A25] items-center justify-center active:scale-95">
                      <Play size={12} color="#7A1E1E" fill="#7A1E1E" className="ml-0.5" />
                    </View>
                  </View>
                </View>
              </ScriptureCard>
            </View>

            {/* Sacred Categories */}
            <View className="mb-6">
              <Text className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-5 mb-3 font-inter">
                Categories
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                {['Scriptures', 'Daily Prayers', 'Meditation', 'Vedas'].map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => navigation.navigate('LibraryTab')}
                    className="px-5 py-2 rounded-full mr-3 bg-white dark:bg-[#1C1513] border border-[#E6DFD3] dark:border-[#3A2A25] active:bg-[#7A1E1E]/5"
                  >
                    <Text className="text-xs font-semibold text-[#3A2E2B] dark:text-neutral-300 font-inter">
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* All Books (Vertical Grid) */}
            <View className="mb-8">
              <View className="flex-row justify-between items-center px-5 mb-4">
                <Text className="text-xs font-bold text-neutral-400 uppercase tracking-widest font-inter">
                  All Books
                </Text>
                <Pressable onPress={() => navigation.navigate('LibraryTab')} className="flex-row items-center">
                  <Text className="text-[10px] text-[#7A1E1E] dark:text-[#D4AF37] font-bold uppercase tracking-wider font-inter">
                    View All
                  </Text>
                  <ChevronRight size={12} color="#7A1E1E" />
                </Pressable>
              </View>

              <View className="flex-row flex-wrap justify-between px-5">
                {featuredBooks.map((book) => (
                  <Pressable
                    key={book.id}
                    onPress={() => navigation.navigate('PDFViewer', { bookId: book.id, title: book.title, offline: isOffline })}
                    className="w-[47%] mb-6"
                  >
                    <View 
                      style={{
                        width: '100%',
                        aspectRatio: 0.73,
                        borderRadius: 16,
                        overflow: 'hidden',
                        shadowColor: '#3A2E2B',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.08,
                        shadowRadius: 6,
                        elevation: 3,
                      }}
                      className="bg-neutral-100 border border-[#E6DFD3]/40"
                    >
                      <Image
                        source={book.cover}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                      {book.isPremium && (
                        <View className="absolute top-2 left-2 bg-[#D4AF37] px-1.5 py-0.5 rounded">
                          <Text className="text-[7px] font-bold text-white uppercase font-inter">Premium</Text>
                        </View>
                      )}
                    </View>
                    <Text 
                      numberOfLines={1} 
                      className="text-sm font-bold text-[#3A2E2B] dark:text-[#E6DFD3] font-inter mt-2.5 text-center w-full"
                    >
                      {book.title}
                    </Text>
                    <Text className="text-[11px] text-neutral-500 font-inter mt-0.5 text-center">
                      {book.chaptersCount || 3} Chapters • {book.mantrasCount || 36} Mantras
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
