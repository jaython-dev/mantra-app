import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Download, Trash2, Folder, ShieldCheck, Play, ArrowLeft } from 'lucide-react-native';
import { useFavoritesStore } from '../../store/favoritesStore';
import { BOOKS, Book, Chapter } from '../../utils/mantraData';
import { ScriptureCard, EmptyState, DividerDecoration } from '../../components/ui/DesignSystem';
import { usePlayerStore } from '../../store/playerStore';
import { useNavigation } from '@react-navigation/native';

export const DownloadsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'books' | 'chapters'>('books');
  const { downloadedChapters, toggleChapterDownload } = useFavoritesStore();
  const { playMantra, currentMantra } = usePlayerStore();

  // Filter books that have at least one downloaded chapter
  const downloadedBooks = BOOKS.filter((book) => {
    return book.chapters.some((ch) => downloadedChapters.includes(ch.id));
  });

  // Flat list of downloaded chapters
  const allDownloadedChapters = BOOKS.reduce<{ book: Book; chapter: Chapter }[]>((acc, book) => {
    book.chapters.forEach((ch) => {
      if (downloadedChapters.includes(ch.id)) {
        acc.push({ book, chapter: ch });
      }
    });
    return acc;
  }, []);

  const handleClearAllDownloads = () => {
    Alert.alert(
      'Clear All Downloads',
      'Are you sure you want to delete all offline audiobooks and chapters? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => {
            downloadedChapters.forEach((chId) => {
              toggleChapterDownload(chId);
            });
          },
        },
      ]
    );
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

  // Mock Storage Stats
  const usedStorageMB = downloadedChapters.length * 12.4; // 12.4 MB per chapter average
  const totalStorageMB = 1024 * 64; // 64 GB
  const freeStorageMB = totalStorageMB - usedStorageMB;
  const storagePercentage = (usedStorageMB / 250) * 100; // Visual scaling out of 250MB limit

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
              Offline Downloads
            </Text>
            <Text className="text-xs text-neutral-500 mt-1 uppercase tracking-wider font-inter">
              Listen to chants without internet access
            </Text>
          </View>
          {downloadedChapters.length > 0 && (
            <Pressable
              onPress={handleClearAllDownloads}
              className="p-2 bg-red-500/5 rounded-full border border-red-500/10 active:scale-95"
            >
              <Trash2 size={18} color="#EF4444" />
            </Pressable>
          )}
        </View>

        {/* Storage Bar Indicator */}
        <View className="bg-white dark:bg-[#1C1513] border border-[#E6DFD3] dark:border-[#3A2A25] rounded-[20px] p-5 mb-6 shadow-sm shadow-[#3A2E2B]/5">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <Folder size={16} color="#7A1E1E" />
              <Text className="text-xs font-bold text-[#3A2E2B] dark:text-neutral-300 ml-2 font-inter">
                App Storage Usage
              </Text>
            </View>
            <Text className="text-xs font-bold text-[#7A1E1E] dark:text-[#D4AF37] font-inter">
              {usedStorageMB.toFixed(1)} MB Used
            </Text>
          </View>

          {/* Progress bar */}
          <View className="h-2.5 bg-[#E6DFD3] dark:bg-[#2D221F] rounded-full overflow-hidden mb-2">
            <View
              style={{ width: `${Math.min(100, storagePercentage)}%` }}
              className="h-full bg-[#7A1E1E] dark:bg-[#D4AF37]"
            />
          </View>
          <Text className="text-[10px] text-neutral-400 font-inter">
            Cached audio tracks and scriptures. Max storage allocated dynamically.
          </Text>
        </View>

        {/* Tab Toggle */}
        <View className="flex-row bg-[#E6DFD3]/40 dark:bg-[#2D221F]/60 border border-[#E6DFD3] dark:border-[#3A2A25] rounded-xl p-1 mb-6">
          <Pressable
            onPress={() => setActiveTab('books')}
            className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === 'books' ? 'bg-white dark:bg-[#1C1513] border border-[#E6DFD3]/50 shadow-sm' : ''}`}
          >
            <Text className={`text-xs font-bold font-inter ${activeTab === 'books' ? 'text-[#7A1E1E] dark:text-white' : 'text-neutral-500'}`}>
              Books ({downloadedBooks.length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('chapters')}
            className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === 'chapters' ? 'bg-white dark:bg-[#1C1513] border border-[#E6DFD3]/50 shadow-sm' : ''}`}
          >
            <Text className={`text-xs font-bold font-inter ${activeTab === 'chapters' ? 'text-[#7A1E1E] dark:text-white' : 'text-neutral-500'}`}>
              Chapters ({allDownloadedChapters.length})
            </Text>
          </Pressable>
        </View>

        {/* Main Content list */}
        {activeTab === 'books' ? (
          downloadedBooks.length === 0 ? (
            <EmptyState
              title="No Downloaded Books"
              message="Chants and reading materials you download will appear here."
              icon={<Download size={32} color="#7A1E1E" />}
            />
          ) : (
            <View className="space-y-4">
              {downloadedBooks.map((book) => {
                const bookChapters = book.chapters.filter((ch) => downloadedChapters.includes(ch.id));
                return (
                  <ScriptureCard
                    key={book.id}
                    onPress={() => navigation.navigate('PDFViewer', { bookId: book.id, title: book.title })}
                    style={{ padding: 14 }}
                  >
                    <View className="flex-row items-center">
                      <Folder size={28} color="#7A1E1E" />
                      <View className="flex-1 ml-4">
                        <Text className="text-base font-bold text-[#3A2E2B] dark:text-[#E6DFD3] font-inter">
                          {book.title}
                        </Text>
                        <Text className="text-xs text-neutral-500 font-inter">
                          {bookChapters.length} of {book.chaptersCount} chapters downloaded
                        </Text>
                      </View>
                      <View className="flex-row items-center space-x-1">
                        <ShieldCheck size={16} color="#D4AF37" />
                        <Text className="text-[10px] text-[#D4AF37] font-semibold font-inter">Offline</Text>
                      </View>
                    </View>
                  </ScriptureCard>
                );
              })}
            </View>
          )
        ) : allDownloadedChapters.length === 0 ? (
          <EmptyState
            title="No Offline Chapters"
            message="Chants and reading materials you download will appear here."
            icon={<Download size={32} color="#7A1E1E" />}
          />
        ) : (
          <View className="space-y-4">
            {allDownloadedChapters.map(({ book, chapter }) => (
              <ScriptureCard key={chapter.id} style={{ padding: 14 }}>
                <View className="flex-row justify-between items-center">
                  <View className="flex-1 pr-3">
                    <Text className="text-sm font-bold text-[#7A1E1E] dark:text-[#E6DFD3] font-inter">
                      {chapter.title}
                    </Text>
                    <Text className="text-[10px] text-neutral-400 font-medium font-inter mt-0.5">
                      Scripture: {book.title} • {Math.floor(chapter.duration / 60)}m {chapter.duration % 60}s
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
                      onPress={() => toggleChapterDownload(chapter.id)}
                      className="w-9 h-9 rounded-full bg-red-500/5 items-center justify-center border border-red-500/10 active:scale-95"
                    >
                      <Trash2 size={14} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>
              </ScriptureCard>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DownloadsScreen;
