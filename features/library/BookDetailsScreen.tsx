import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, Pressable, ActivityIndicator, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { ArrowLeft, BookOpen, Download, Play, Bookmark, BookmarkCheck, ShieldAlert, Share2 } from 'lucide-react-native';
import { BOOKS, Book, Chapter } from '../../utils/mantraData';
import { useFavoritesStore } from '../../store/favoritesStore';
import { usePlayerStore } from '../../store/playerStore';
import { useAuthStore } from '../../store/authStore';
import { apiService, BookData, ChapterData } from '../../services/api/apiService';
import { ScriptureCard, DividerDecoration } from '../../components/ui/DesignSystem';
import { useTheme } from '../../hooks/useTheme';

export const BookDetailsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { isDark } = useTheme();
  const { bookId, offline } = route.params || {};

  const { hasActiveSubscription } = useAuthStore();
  const {
    toggleChapterBookmark,
    toggleChapterDownload,
    isChapterBookmarked,
    isChapterDownloaded,
    activeBookProgress,
    updateBookProgress,
  } = useFavoritesStore();

  const { playMantra, currentMantra } = usePlayerStore();

  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!!offline);
  const [activeTab, setActiveTab] = useState<'chapters' | 'about'>('chapters');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPremiumLocked, setIsPremiumLocked] = useState(false);

  useEffect(() => {
    loadBookDetails();
  }, [bookId]);

  const loadBookDetails = async () => {
    setLoading(true);
    try {
      if (isOffline) {
        throw new Error('Running in offline mode');
      }

      // 1. Fetch live book details
      const bookData: BookData = await apiService.library.getBook(bookId);
      
      // 2. Fetch live chapters
      const chaptersList: ChapterData[] = await apiService.library.getBookChapters(bookId);

      const formattedChapters = chaptersList.map((ch) => ({
        id: ch.id,
        title: ch.title,
        chapter_number: ch.chapter_number,
        description: ch.description,
        duration: ch.estimated_duration,
        mantrasCount: ch.mantras_count || 12,
        pdfUrl: ch.pdf_file_url,
        audio: ch.thumbnail, // thumbnail can double as dummy audio url or we request direct
        verses: [] // populated by reader later
      }));

      const bookPdfUrl = bookData.pdf_file_url || formattedChapters.find((c) => c.pdfUrl)?.pdfUrl || null;

      const formattedBook = {
        id: bookData.id,
        title: bookData.title,
        author: bookData.author,
        language: bookData.language,
        cover: { uri: bookData.cover_image_url || bookData.cover_image },
        description: bookData.description,
        chaptersCount: bookData.chapters_count || chaptersList.length,
        mantrasCount: bookData.mantras_count,
        estimatedReadingTime: `${Math.floor(bookData.estimated_duration / 60)} mins`,
        category: bookData.category_name,
        isPremium: bookData.is_premium,
        pdfUrl: bookPdfUrl
      };

      setSelectedBook(formattedBook);
      setChapters(formattedChapters);
    } catch (e) {
      console.warn('API error fetching book details, loading fallback mock book data', e);
      setIsOffline(true);
      
      const status = e && typeof e === 'object' && 'status' in e ? (e as any).status : 0;
      if (status === 403) {
        setIsPremiumLocked(true);
        setErrorMsg('Premium content requires an active subscription.');
      } else {
        setErrorMsg(e && typeof e === 'object' && 'message' in e ? (e as any).message : JSON.stringify(e));
        
        // Offline fallback: Use local mock books dataset with smart matching fallback
        let localBook = BOOKS.find((b) => b.id === bookId);
        if (!localBook) {
          const lowerId = String(bookId).toLowerCase();
          if (lowerId.includes('gita')) {
            localBook = BOOKS.find((b) => b.id === 'bhagavad_gita');
          } else if (lowerId.includes('upanishad') || lowerId.includes('isha')) {
            localBook = BOOKS.find((b) => b.id === 'isha_upanishad');
          } else if (lowerId.includes('veda') || lowerId.includes('rig') || lowerId.includes('bodhan') || lowerId.includes('shiv')) {
            localBook = BOOKS.find((b) => b.id === 'rigveda');
          }
          
          if (!localBook) {
            localBook = BOOKS[0];
          }
        }
        
        if (localBook) {
          const dummyPdf = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
          const localChapters = localBook.chapters.map((ch: any) => ({
            ...ch,
            pdfUrl: ch.pdfUrl || dummyPdf
          }));
          setSelectedBook({
            ...localBook,
            pdfUrl: (localBook as any).pdfUrl || dummyPdf
          });
          setChapters(localChapters);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#FAF7F2] dark:bg-[#120E0D] items-center justify-center">
        <ActivityIndicator size="large" color="#7A1E1E" />
      </SafeAreaView>
    );
  }

  if (isPremiumLocked) {
    return (
      <SafeAreaView className="flex-1 bg-[#FAF7F2] dark:bg-[#120E0D] items-center justify-center px-6">
        <View className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 items-center justify-center mb-6">
          <ShieldAlert size={32} color="#D4AF37" />
        </View>
        <Text className="text-[#3A2E2B] dark:text-[#FAF7F2] text-xl font-bold text-center font-inter mb-2">
          Premium Scripture
        </Text>
        <Text className="text-[#8C7A6B] dark:text-neutral-400 text-sm text-center font-inter mb-8 leading-relaxed max-w-[280px]">
          This sacred commentary and recitation requires an active Yearly Mantra Pass. Unlock all scriptures, audiobooks, and commentaries.
        </Text>
        <Pressable
          onPress={() => navigation.navigate('ProfileTab')}
          className="w-full bg-[#D4AF37] py-4 rounded-2xl items-center justify-center shadow-md active:scale-[0.99] mb-4"
        >
          <Text className="text-white font-bold text-sm font-inter">
            Activate Yearly Pass
          </Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.goBack()}
          className="py-3 items-center justify-center active:opacity-70"
        >
          <Text className="text-[#7A1E1E] dark:text-[#D4AF37] font-bold text-xs font-inter uppercase tracking-wider">
            Go Back
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!selectedBook) {
    return (
      <SafeAreaView className="flex-1 bg-[#FAF7F2] dark:bg-[#120E0D] items-center justify-center px-4">
        <Text className="text-red-500 font-bold font-inter text-lg">Book Not Found</Text>
        <Text className="text-neutral-500 font-inter mt-2 text-center text-xs">{errorMsg || 'No local book matches the requested ID.'}</Text>
      </SafeAreaView>
    );
  }

  // Get active progress values
  const currentProgress = activeBookProgress[selectedBook.id];
  const lastActiveChapterId = currentProgress?.chapterId || chapters[0]?.id;
  const lastActiveVerseIndex = currentProgress?.verseIndex || 0;

  const handleStartReading = () => {
    if (selectedBook.isPremium && !hasActiveSubscription) {
      Alert.alert(
        'Premium Scripture',
        'This scripture is premium content. Please activate a Yearly Mantra Pass in your Profile tab to unlock all sacred books and recitations.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Profile', onPress: () => navigation.navigate('ProfileTab') }
        ]
      );
      return;
    }

    if (!currentProgress && chapters[0]) {
      updateBookProgress(selectedBook.id, chapters[0].id, 0);
    }
    navigation.navigate('Reader', {
      bookId: selectedBook.id,
      chapterId: lastActiveChapterId,
      verseIndex: lastActiveVerseIndex,
    });
  };

  const handleOpenPDF = (chapterTarget?: any) => {
    if (isOffline) {
      Alert.alert(
        'Offline Mode',
        'Viewing scripture PDFs requires an active internet connection. Please check your network and try again.'
      );
      return;
    }

    const targetChapter = chapterTarget || chapters.find((c: any) => c.pdfUrl);
    const pdfUrl = targetChapter?.pdfUrl || selectedBook.pdfUrl;
    const title = targetChapter ? `${selectedBook.title} - ${targetChapter.title}` : selectedBook.title;
    const chapterId = targetChapter?.id;

    if (pdfUrl) {
      navigation.navigate('PDFViewer', {
        pdfUrl,
        title,
        bookId: selectedBook.id,
        chapterId
      });
    } else {
      Alert.alert('Not Available', 'A PDF version of this scripture is not currently available.');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this holy scripture: ${selectedBook.title} on Brahmpath!`,
      });
    } catch (error) {
      console.warn(error);
    }
  };

  const handlePlayChapterAudio = async (chapter: any) => {
    if (selectedBook.isPremium && !hasActiveSubscription) {
      Alert.alert(
        'Premium Audiobook',
        'This scripture is a premium audiobook. Please activate a Yearly Mantra Pass in your Profile tab to unlock all sacred commentaries and recitations.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Profile', onPress: () => navigation.navigate('ProfileTab') }
        ]
      );
      return;
    }

    // Resolve live audio source from API or use local fallback
    let audioUrl = chapter.audio;
    let verses = chapter.verses || [];
    
    try {
      if (!isOffline) {
        // Fetch mantras inside chapter to extract audio track
        const mantrasList = await apiService.library.getChapterMantras(chapter.id);
        if (mantrasList.length > 0 && mantrasList[0].audio) {
          audioUrl = mantrasList[0].audio.audio_file_url || mantrasList[0].audio.audio_file;
          verses = mantrasList.map((m) => ({
            start: parseFloat(String(m.audio?.start_time || 0)),
            end: parseFloat(String(m.audio?.end_time || 20)),
            text: m.sanskrit_text,
            translation: m.english_text,
          }));
        }
      }
    } catch (e) {
      console.warn('Failed to load live audio track, falling back to local audio resource', e);
    }

    const mantraTrack = {
      id: chapter.id,
      title: chapter.title,
      deity: selectedBook.title,
      category: 'Audiobooks',
      language: selectedBook.language,
      duration: chapter.duration,
      cover: selectedBook.cover,
      audio: audioUrl,
      lyrics: {
        id: chapter.id,
        title: chapter.title,
        verses: verses.length > 0 ? verses : [
          { start: 0, end: chapter.duration, text: chapter.description, translation: '' }
        ]
      },
      description: chapter.description,
    };

    playMantra(mantraTrack as any);
    navigation.navigate('MantraDetails', { mantraId: chapter.id });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2] dark:bg-[#120E0D]" edges={['top', 'left', 'right']}>
      {/* Top Header Bar */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#E6DFD3] dark:border-[#2D221F] bg-[#FAF7F2] dark:bg-[#120E0D]">
        <Pressable onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full active:bg-[#E6DFD3]/40 dark:active:bg-[#2D221F]/40">
          <ArrowLeft size={24} color={isDark ? '#E6DFD3' : '#7A1E1E'} />
        </Pressable>
        {selectedBook.isPremium && (
          <View className="bg-[#D4AF37]/20 border border-[#D4AF37]/50 rounded-full px-3 py-1 flex-row items-center">
            <ShieldAlert size={11} color="#D4AF37" />
            <Text className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider ml-1">Premium</Text>
          </View>
        )}
        <Pressable onPress={handleShare} className="p-2 -mr-2 rounded-full active:bg-[#E6DFD3]/40 dark:active:bg-[#2D221F]/40">
          <Share2 size={22} color={isDark ? '#E6DFD3' : '#7A1E1E'} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: currentMantra ? 180 : 60 }}
      >
        {/* Book Main Cover & Meta Section (Matches Slide 2) */}
        <View className="items-center py-6 px-6 bg-white dark:bg-[#1C1513] border-b border-[#E6DFD3] dark:border-[#2D221F]">
          {/* Custom Gold/Green Background card wrapper */}
          <View className="w-40 h-52 bg-[#2D5A27] dark:bg-[#1B3618] rounded-2xl items-center justify-center border border-[#FAF3E3] dark:border-[#2D221F] shadow-md mb-5 p-2">
            <Image
              source={selectedBook.cover}
              style={{ width: '100%', height: '100%', borderRadius: 10 }}
              resizeMode="cover"
            />
          </View>

          <Text className="text-2xl font-bold text-[#3A2E2B] dark:text-[#FAF7F2] text-center font-inter px-4 mt-2">
            {selectedBook.title}
          </Text>
          <Text className="text-sm text-neutral-500 mt-1 font-inter">
            By {selectedBook.author}
          </Text>

          {/* Quick Stats Horizontal Bar */}
          <View className="flex-row justify-around w-full mt-6 pt-3 px-2 border-t border-[#E6DFD3]/50 dark:border-[#2D221F]/50">
            <View className="items-center">
              <Text className="text-base font-bold text-[#3A2E2B] dark:text-neutral-200 font-inter">
                {selectedBook.chaptersCount}
              </Text>
              <Text className="text-[10px] text-neutral-400 mt-0.5 uppercase tracking-wider font-semibold font-inter">
                Chapters
              </Text>
            </View>
            <View className="w-[1px] h-6 bg-[#E6DFD3] dark:bg-[#2D221F] self-center" />
            <View className="items-center">
              <Text className="text-base font-bold text-[#3A2E2B] dark:text-neutral-200 font-inter">
                {selectedBook.chaptersCount * 15}
              </Text>
              <Text className="text-[10px] text-neutral-400 mt-0.5 uppercase tracking-wider font-semibold font-inter">
                Mantras
              </Text>
            </View>
          </View>
        </View>

        {/* Large Vermilion Action Button (Start/Continue Reading) */}
        <View className="px-5 py-5">
          <Pressable
            onPress={handleStartReading}
            className="w-full bg-[#D12626] py-4 rounded-2xl items-center justify-center shadow-md shadow-[#D12626]/20 active:scale-[0.99]"
          >
            <Text className="text-white font-bold text-sm font-inter">
              {currentProgress ? 'Continue Reading' : 'Start Reading'}
            </Text>
          </Pressable>
        </View>

        {/* Secondary Buttons Row: PDF & Download */}
        {selectedBook.pdfUrl && (
          <View className="px-5 pb-5 flex-row space-x-3">
            <Pressable
              onPress={handleOpenPDF}
              className="flex-1 bg-[#2D5A27] dark:bg-[#1B3618] border border-[#2D5A27] dark:border-[#1B3618] py-3.5 rounded-2xl items-center justify-center flex-row shadow-sm active:scale-[0.99]"
            >
              <BookOpen size={16} color="#FAF7F2" className="mr-2" />
              <Text className="text-white font-bold text-sm font-inter">
                View Scripture PDF
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                if (selectedBook.isPremium && !hasActiveSubscription) {
                  Alert.alert('Premium Access Required', 'Cannot download premium scripture audiobooks without an active Yearly Mantra Pass.');
                  return;
                }
                chapters.forEach(ch => {
                  if (!isChapterDownloaded(ch.id)) {
                    toggleChapterDownload(ch.id);
                  }
                });
              }}
              className="px-5 bg-[#FAF7F2] dark:bg-[#1C1513] border border-[#E6DFD3] dark:border-[#3A2A25] rounded-2xl items-center justify-center active:scale-[0.99]"
            >
              <Download size={18} color="#7A1E1E" />
            </Pressable>
          </View>
        )}

        {/* Segmented Control Tabs (Matches Slide 2) */}
        <View className="flex-row border-b border-[#E6DFD3] dark:border-[#2D221F] mb-4">
          <Pressable
            onPress={() => setActiveTab('chapters')}
            className={`flex-1 items-center py-3 border-b-2 ${
              activeTab === 'chapters' ? 'border-[#D12626]' : 'border-transparent'
            }`}
          >
            <Text
              className={`text-sm font-bold font-inter ${
                activeTab === 'chapters' ? 'text-[#D12626]' : 'text-neutral-400'
              }`}
            >
              Chapters
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('about')}
            className={`flex-1 items-center py-3 border-b-2 ${
              activeTab === 'about' ? 'border-[#D12626]' : 'border-transparent'
            }`}
          >
            <Text
              className={`text-sm font-bold font-inter ${
                activeTab === 'about' ? 'text-[#D12626]' : 'text-neutral-400'
              }`}
            >
              About Book
            </Text>
          </Pressable>
        </View>

        {/* Dynamic Tab Render */}
        {activeTab === 'about' ? (
          <View className="px-5 py-2 mb-6">
            <Text className="text-sm text-[#3A2E2B] dark:text-neutral-300 leading-relaxed font-inter">
              {selectedBook.description}
            </Text>
          </View>
        ) : (
          <View className="px-5">
            {chapters.length === 0 ? (
              <Text className="text-center text-neutral-400 py-6 font-inter">No chapters available</Text>
            ) : (
              chapters.map((chapter, index) => {
                const bookmarked = isChapterBookmarked(chapter.id);
                const downloaded = isChapterDownloaded(chapter.id);

                return (
                  <ScriptureCard
                    key={chapter.id}
                    onPress={() =>
                      navigation.navigate('Reader', {
                        bookId: selectedBook.id,
                        chapterId: chapter.id,
                        verseIndex: 0,
                      })
                    }
                    style={{ padding: 12, marginBottom: 12 }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1 pr-3">
                        {/* Red Document Icon inside background circular view (Slide 3) */}
                        <View className="w-10 h-10 rounded-full bg-[#FAF7F2] dark:bg-[#1C1513] border border-[#E6DFD3] dark:border-[#3A2A25] items-center justify-center mr-3">
                          <BookOpen size={16} color="#7A1E1E" />
                        </View>
                        <View className="flex-1 pr-2">
                          <Text className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-inter">
                            अध्याय {chapter.chapter_number || index + 1}
                          </Text>
                          <Text className="text-sm font-bold text-[#3A2E2B] dark:text-[#E6DFD3] font-inter mt-0.5">
                            {chapter.title}
                          </Text>
                          <Text className="text-xs text-neutral-500 font-inter mt-0.5">
                            {chapter.mantrasCount || 12} मंत्र • {Math.floor(chapter.duration / 60)} min
                          </Text>
                        </View>
                      </View>

                      {/* Control items */}
                      <View className="flex-row items-center space-x-2">
                        {/* Inline Chapter PDF */}
                        {chapter.pdfUrl && (
                          <Pressable
                            onPress={() => handleOpenPDF(chapter)}
                            className="w-8 h-8 rounded-full bg-[#2D5A27]/10 dark:bg-[#2D5A27]/20 items-center justify-center border border-[#2D5A27]/20 active:scale-95"
                          >
                            <BookOpen size={13} color="#2D5A27" />
                          </Pressable>
                        )}

                        {/* Inline Play/Listen */}
                        <Pressable
                          onPress={() => handlePlayChapterAudio(chapter)}
                          className="w-8 h-8 rounded-full bg-[#7A1E1E]/5 dark:bg-[#7A1E1E]/10 items-center justify-center border border-[#7A1E1E]/10 active:scale-95"
                        >
                          <Play size={12} color="#7A1E1E" fill="#7A1E1E" className="ml-0.5" />
                        </Pressable>

                        {/* Inline Bookmark */}
                        <Pressable
                          onPress={() => toggleChapterBookmark(chapter.id)}
                          className="w-8 h-8 rounded-full bg-[#FAF7F2] dark:bg-[#1C1513] items-center justify-center border border-[#E6DFD3] dark:border-[#3A2A25] active:scale-95"
                        >
                          {bookmarked ? (
                            <BookmarkCheck size={13} color="#D4AF37" fill="#D4AF37" />
                          ) : (
                            <Bookmark size={13} color="#8C7A6B" />
                          )}
                        </Pressable>
                      </View>
                    </View>

                    {/* Simulating progress bar */}
                    <View className="mt-3.5 h-0.5 bg-[#E6DFD3] dark:bg-[#2D221F] rounded-full overflow-hidden">
                      <View
                        style={{ width: downloaded ? '100%' : '15%' }}
                        className="h-full bg-[#D4AF37]"
                      />
                    </View>
                  </ScriptureCard>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
export default BookDetailsScreen;
