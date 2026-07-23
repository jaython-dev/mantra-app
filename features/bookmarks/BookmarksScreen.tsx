import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Heart, Bookmark, History, Play, Trash2, ChevronRight } from 'lucide-react-native';
import { useFavoritesStore } from '../../store/favoritesStore';
import { usePlayerStore } from '../../store/playerStore';
import { MANTRAS, BOOKS, Mantra, Book, Chapter } from '../../utils/mantraData';
import { ScriptureCard, EmptyState, DividerDecoration } from '../../components/ui/DesignSystem';

export const BookmarksScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'mantras' | 'chapters' | 'history'>('mantras');
  
  const {
    favorites,
    bookmarkedChapters,
    recentlyPlayed,
    toggleFavorite,
    toggleChapterBookmark,
    fetchFavorites,
    fetchHistory,
  } = useFavoritesStore();

  const { playMantra, currentMantra } = usePlayerStore();

  useEffect(() => {
    fetchFavorites();
    fetchHistory();
  }, []);

  // Map IDs to Mantra records
  const favoriteMantras = favorites
    .map((id) => MANTRAS.find((m) => m.id === id))
    .filter((m): m is Mantra => !!m);

  // Map bookmarked chapters to Book/Chapter models
  const bookmarkedChaptersList = BOOKS.reduce<{ book: Book; chapter: Chapter }[]>((acc, book) => {
    book.chapters.forEach((ch) => {
      if (bookmarkedChapters.includes(ch.id)) {
        acc.push({ book, chapter: ch });
      }
    });
    return acc;
  }, []);

  // Map history IDs to Mantra/Book items
  const historyList = recentlyPlayed
    .map((id) => {
      // Find as mantra
      const mantra = MANTRAS.find((m) => m.id === id);
      if (mantra) return { type: 'mantra', item: mantra };

      // Find as chapter
      for (const book of BOOKS) {
        const ch = book.chapters.find((c) => c.id === id);
        if (ch) return { type: 'chapter', item: ch, book };
      }
      return null;
    })
    .filter((x): x is NonNullable<typeof x> => !!x);

  const handlePlayMantra = (mantra: Mantra) => {
    playMantra(mantra);
    navigation.navigate('MantraDetails', { mantraId: mantra.id });
  };

  const handlePlayChapter = (book: Book, chapter: Chapter) => {
    const track = {
      id: chapter.id,
      title: chapter.title,
      deity: book.title,
      category: 'Audiobooks',
      language: book.language,
      duration: chapter.duration,
      cover: book.cover,
      audio: chapter.audio,
      lyrics: {
        id: chapter.id,
        title: chapter.title,
        verses: chapter.verses.map((v) => ({
          start: v.audioStart || 0,
          end: v.audioEnd || 20,
          text: v.text,
          translation: v.translation,
        })),
      },
      description: chapter.description,
    };
    playMantra(track as any);
    navigation.navigate('MantraDetails', { mantraId: chapter.id });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2] dark:bg-[#120E0D]">
      <View className="px-5 my-6">
        <Text className="text-3xl font-bold text-[#7A1E1E] dark:text-[#E6DFD3] font-inter">
          My Sanctuary
        </Text>
        <Text className="text-xs text-neutral-500 mt-1 uppercase tracking-wider font-inter">
          Your saved scriptures, chants, and study logs
        </Text>
      </View>

      {/* Tab bar */}
      <View className="flex-row border-b border-[#E6DFD3] dark:border-[#2D221F] px-5 mb-5 bg-[#FAF7F2] dark:bg-[#120E0D]">
        {(['mantras', 'chapters', 'history'] as const).map((tab) => {
          const active = activeTab === tab;
          const label = { mantras: 'Saved Chants', chapters: 'Saved Chapters', history: 'Reading History' }[tab];
          const icon = {
            mantras: <Heart size={14} color={active ? '#7A1E1E' : '#8C7A6B'} fill={active ? '#7A1E1E' : 'transparent'} />,
            chapters: <Bookmark size={14} color={active ? '#7A1E1E' : '#8C7A6B'} fill={active ? '#7A1E1E' : 'transparent'} />,
            history: <History size={14} color={active ? '#7A1E1E' : '#8C7A6B'} />,
          }[tab];

          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className="flex-row items-center space-x-2 pb-3.5 mr-6 relative active:scale-95"
            >
              {icon}
              <Text className={`text-xs font-bold font-inter ${active ? 'text-[#7A1E1E] dark:text-[#FAF7F2]' : 'text-neutral-400'}`}>
                {label}
              </Text>
              {active && (
                <View className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#7A1E1E] dark:bg-[#D4AF37] rounded-full" />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Lists */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: currentMantra ? 180 : 100 }}
      >
        {activeTab === 'mantras' && (
          favoriteMantras.length === 0 ? (
            <EmptyState
              title="No Favorite Mantras"
              message="Chants you favorite while listening will appear in this sanctuary."
              icon={<Heart size={32} color="#7A1E1E" />}
            />
          ) : (
            <View className="space-y-4">
              {favoriteMantras.map((mantra) => (
                <ScriptureCard key={mantra.id} style={{ padding: 14 }}>
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center flex-1 pr-3">
                      <Image source={mantra.cover} style={{ width: 44, height: 44, borderRadius: 10 }} className="bg-neutral-100 mr-3" />
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-[#3A2E2B] dark:text-[#E6DFD3] font-inter" numberOfLines={1}>
                          {mantra.title}
                        </Text>
                        <Text className="text-[10px] text-[#8C7A6B] font-inter mt-0.5">
                          {mantra.deity} • {mantra.category}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center space-x-2">
                      <Pressable
                        onPress={() => handlePlayMantra(mantra)}
                        className="w-9 h-9 rounded-full bg-[#7A1E1E]/5 items-center justify-center border border-[#7A1E1E]/10 active:scale-95"
                      >
                        <Play size={14} color="#7A1E1E" fill="#7A1E1E" className="ml-0.5" />
                      </Pressable>
                      <Pressable
                        onPress={() => toggleFavorite(mantra.id)}
                        className="w-9 h-9 rounded-full bg-[#FAF7F2] dark:bg-[#1C1513] items-center justify-center border border-[#E6DFD3] dark:border-[#3A2A25] active:scale-95"
                      >
                        <Heart size={14} color="#EF4444" fill="#EF4444" />
                      </Pressable>
                    </View>
                  </View>
                </ScriptureCard>
              ))}
            </View>
          )
        )}

        {activeTab === 'chapters' && (
          bookmarkedChaptersList.length === 0 ? (
            <EmptyState
              title="No Saved Chapters"
              message="Keep track of entire chapters of Vedas or Gita by saving them for quick access."
              icon={<Bookmark size={32} color="#7A1E1E" />}
            />
          ) : (
            <View className="space-y-4">
              {bookmarkedChaptersList.map(({ book, chapter }) => (
                <ScriptureCard key={chapter.id} style={{ padding: 14 }}>
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1 pr-3">
                      <Text className="text-sm font-bold text-[#7A1E1E] dark:text-[#E6DFD3] font-inter">
                        {chapter.title}
                      </Text>
                      <Text className="text-[10px] text-neutral-500 font-inter mt-0.5" numberOfLines={1}>
                        Book: {book.title} • {chapter.mantrasCount} Verses
                      </Text>
                    </View>

                    <View className="flex-row items-center space-x-2">
                      <Pressable
                        onPress={() => handlePlayChapter(book, chapter)}
                        className="w-9 h-9 rounded-full bg-[#7A1E1E]/5 items-center justify-center border border-[#7A1E1E]/10 active:scale-95"
                      >
                        <Play size={14} color="#7A1E1E" fill="#7A1E1E" className="ml-0.5" />
                      </Pressable>
                      <Pressable
                        onPress={() => toggleChapterBookmark(chapter.id)}
                        className="w-9 h-9 rounded-full bg-[#FAF7F2] dark:bg-[#1C1513] items-center justify-center border border-[#E6DFD3] dark:border-[#3A2A25] active:scale-95"
                      >
                        <Bookmark size={14} color="#D4AF37" fill="#D4AF37" />
                      </Pressable>
                    </View>
                  </View>
                </ScriptureCard>
              ))}
            </View>
          )
        )}

        {activeTab === 'history' && (
          historyList.length === 0 ? (
            <EmptyState
              title="No Reading History"
              message="A list of books you read and mantras you chanted will compile as you explore."
              icon={<History size={32} color="#7A1E1E" />}
            />
          ) : (
            <View className="relative pl-6 border-l border-[#E6DFD3] dark:border-[#3A2A25] ml-3 py-2 space-y-6">
              {historyList.map((entry, idx) => {
                const isCh = entry.type === 'chapter';
                const title = isCh ? entry.item.title : (entry.item as Mantra).title;
                const subtitle = isCh ? `Scripture: ${entry.book?.title}` : `Hymn • ${(entry.item as Mantra).deity}`;
                
                return (
                  <View key={`${idx}`} className="relative">
                    {/* Circle bullet on timeline line */}
                    <View className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#7A1E1E] border-2 border-[#FAF7F2] dark:border-[#120E0D]" />
                    
                    <View className="bg-white dark:bg-[#1C1513] border border-[#E6DFD3] dark:border-[#3A2A25] rounded-2xl p-4 shadow-sm shadow-[#3A2E2B]/5">
                      <Text className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest font-inter mb-1">
                        Timeline Log
                      </Text>
                      <Text className="text-sm font-bold text-[#3A2E2B] dark:text-[#FAF7F2] font-inter">
                        {title}
                      </Text>
                      <Text className="text-xs text-neutral-500 font-inter mt-0.5">
                        {subtitle}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default BookmarksScreen;
