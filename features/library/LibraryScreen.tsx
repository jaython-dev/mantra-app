import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Search, BookOpen, Clock, ChevronRight } from 'lucide-react-native';
import { BOOKS, Book } from '../../utils/mantraData';
import { ScriptureCard, DividerDecoration } from '../../components/ui/DesignSystem';
import { apiService, BookData } from '../../services/api/apiService';
import { useAuthStore } from '../../store/authStore';
import { usePlayerStore } from '../../store/playerStore';
import { Skeleton, BookCardSkeleton } from '../../components/ui/Skeleton';

export const LibraryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { currentMantra } = usePlayerStore();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All', 'Scriptures', 'Vedas', 'Upanishads']);

  const { token } = useAuthStore();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    loadCatalog();
  }, [selectedCat, search]);

  const loadCatalog = async () => {
    setLoading(true);
    setIsOffline(false);
    try {
      // 1. Fetch live categories list
      const catsList = await apiService.library.getCategories().catch(() => []);
      if (catsList.length > 0) {
        setCategories(['All', ...catsList.map(c => c.name)]);
      }

      // 2. Fetch live books from Django API
      // Translate category to category UUID if matching
      let categoryId: string | undefined = undefined;
      if (selectedCat !== 'All' && catsList.length > 0) {
        const found = catsList.find(c => c.name.toLowerCase() === selectedCat.toLowerCase());
        if (found) categoryId = found.id;
      }

      const liveBooks = await apiService.library.getBooks({
        category: categoryId,
        search: search || undefined
      });

      // Map Django Book API model to frontend rendering keys
      const formattedBooks = liveBooks.map((b: BookData) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        language: b.language,
        cover: { uri: b.cover_image },
        description: b.description,
        chaptersCount: 18, // default fallback
        estimatedReadingTime: `${Math.floor(b.estimated_duration / 60)} mins`,
        category: b.category_name,
        isPremium: b.is_premium
      }));
      setBooks(formattedBooks);
    } catch (e) {
      console.warn('API error fetching catalog, loading offline fallback assets', e);
      setIsOffline(true);
      // Offline fallback: Use local mock data
      const offlineBooks = BOOKS.filter((book) => {
        const matchesSearch =
          book.title.toLowerCase().includes(search.toLowerCase()) ||
          book.author.toLowerCase().includes(search.toLowerCase());
        const matchesCat =
          selectedCat === 'All' ||
          (selectedCat === 'Scriptures' && book.category === 'Scriptures') ||
          (selectedCat === 'Upanishads' && book.id.includes('upanishad')) ||
          (selectedCat === 'Vedas' && book.id.includes('rigveda'));
        return matchesSearch && matchesCat;
      });
      setBooks(offlineBooks);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2] dark:bg-[#120E0D]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: currentMantra ? 180 : 100 }}
      >
        {/* Header Title */}
        <View className="my-6 flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-bold text-[#7A1E1E] dark:text-[#E6DFD3] font-inter">
              Scripture Library
            </Text>
            <Text className="text-xs text-neutral-500 mt-1 uppercase tracking-wider font-inter">
              Browse through ancient wisdom & audiobooks
            </Text>
          </View>
          {isOffline && (
            <View className="bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 px-3 py-1 rounded-full">
              <Text className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest font-inter">
                Offline
              </Text>
            </View>
          )}
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-[#E6DFD3]/40 dark:bg-[#2D221F]/60 border border-[#E6DFD3] dark:border-[#3A2A25] rounded-2xl px-4 py-3 mb-6">
          <Search size={18} color="#7A1E1E" />
          <TextInput
            placeholder="Search books, authors..."
            placeholderTextColor="#8C7A6B"
            className="flex-1 ml-3 text-sm text-[#3A2E2B] dark:text-neutral-200 font-inter"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Category Horizontal Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6" contentContainerStyle={{ paddingRight: 20 }}>
          {categories.map((cat) => {
            const active = selectedCat === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setSelectedCat(cat)}
                className={`px-5 py-2.5 rounded-full mr-3 border ${
                  active
                    ? 'bg-[#7A1E1E] border-[#7A1E1E]'
                    : 'bg-[#FAF7F2] border-[#E6DFD3] dark:bg-[#1C1513] dark:border-[#3A2A25]'
                }`}
              >
                <Text
                  className={`text-xs font-semibold font-inter ${
                    active ? 'text-[#FAF7F2]' : 'text-[#3A2E2B] dark:text-neutral-400'
                  }`}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {loading ? (
          <View className="mt-2">
            {/* Featured Scripture Banner Skeleton */}
            <Skeleton width="100%" height={150} borderRadius={20} style={{ marginBottom: 32 }} />
            
            {/* Sub-header Title Skeleton */}
            <Skeleton width="35%" height={20} borderRadius={4} style={{ marginBottom: 20 }} />
            
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
            {/* Featured Scripture Banner */}
            {books.length > 0 && (
              <Pressable
                onPress={() => navigation.navigate('PDFViewer', { bookId: books[0].id, title: books[0].title, offline: isOffline })}
                className="mb-8 overflow-hidden rounded-[20px] bg-[#7A1E1E] border border-[#D4AF37] shadow-lg shadow-[#7A1E1E]/20"
              >
                <View className="flex-row p-5 items-center">
                  <Image
                    source={books[0].cover}
                    style={{ width: 80, height: 110, borderRadius: 12 }}
                    className="bg-neutral-100 border border-[#FAF7F2]/20"
                  />
                  <View className="flex-1 ml-5">
                    <View className="bg-[#D4AF37]/20 border border-[#D4AF37]/50 rounded px-2 py-0.5 self-start mb-2">
                      <Text className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider">
                        {books[0].isPremium ? 'Premium Scripture' : 'Featured Scripture'}
                      </Text>
                    </View>
                    <Text className="text-lg font-bold text-[#FAF7F2] font-inter">
                      {books[0].title}
                    </Text>
                    <Text className="text-xs text-[#E6DFD3]/80 mt-1 font-inter">
                      By {books[0].author}
                    </Text>
                    <View className="flex-row items-center mt-3">
                      <Clock size={12} color="#D4AF37" />
                      <Text className="text-[10px] text-[#D4AF37] font-semibold ml-1.5 uppercase font-inter">
                        {books[0].estimatedReadingTime}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#D4AF37" />
                </View>
              </Pressable>
            )}

            {/* Traditional Divider */}
            <DividerDecoration />

            {/* Grid List of Scriptures */}
            <View className="flex-row flex-wrap justify-between px-1">
              {books.length === 0 ? (
                <Text className="text-center text-neutral-400 py-10 w-full font-inter">No books available</Text>
              ) : (
                books.map((book) => (
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
                    <Text className="text-xs text-neutral-500 font-inter mt-0.5 text-center">
                      {book.author}
                    </Text>
                  </Pressable>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
export default LibraryScreen;
