import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, Dimensions, Platform, Alert, FlatList, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { usePlayerStore } from '../../store/playerStore';
import { useAuthStore } from '../../store/authStore';
import { apiService, BookData, ChapterData, MantraData } from '../../services/api/apiService';

// PDF Page images extracted at high resolution
const pageImages = [
  require('../../assets/images/book_pages/page_1.png'),
  require('../../assets/images/book_pages/page_2.png'),
  require('../../assets/images/book_pages/page_3.png'),
  require('../../assets/images/book_pages/page_4.png'),
  require('../../assets/images/book_pages/page_5.png'),
  require('../../assets/images/book_pages/page_6.png'),
  require('../../assets/images/book_pages/page_7.png'),
  require('../../assets/images/book_pages/page_8.png'),
  require('../../assets/images/book_pages/page_9.png'),
  require('../../assets/images/book_pages/page_10.png'),
  require('../../assets/images/book_pages/page_11.png'),
  require('../../assets/images/book_pages/page_12.png'),
  require('../../assets/images/book_pages/page_13.png'),
  require('../../assets/images/book_pages/page_14.png'),
  require('../../assets/images/book_pages/page_15.png'),
  require('../../assets/images/book_pages/page_16.png'),
];

// Coordinates of the green play buttons extracted from the PDF (points out of 612x1008)
const pageLinks: Record<number, Array<{ x0: number; y0: number; x1: number; y1: number }>> = {
  1: [
    { x0: 18.0, y0: 379.0, x1: 43.0, y1: 402.0 },
    { x0: 15.0, y0: 476.0, x1: 39.0, y1: 498.0 },
    { x0: 18.0, y0: 716.0, x1: 44.0, y1: 739.0 },
    { x0: 18.0, y0: 960.0, x1: 41.0, y1: 982.0 }
  ],
  2: [
    { x0: 18.0, y0: 249.0, x1: 42.0, y1: 272.0 },
    { x0: 18.0, y0: 548.0, x1: 44.0, y1: 571.0 },
    { x0: 18.0, y0: 801.0, x1: 44.0, y1: 824.0 }
  ],
  3: [
    { x0: 18.0, y0: 119.0, x1: 43.0, y1: 142.0 },
    { x0: 18.0, y0: 214.0, x1: 43.0, y1: 238.0 },
    { x0: 18.0, y0: 310.0, x1: 43.0, y1: 333.0 },
    { x0: 18.0, y0: 569.0, x1: 43.0, y1: 591.0 },
    { x0: 18.0, y0: 833.0, x1: 42.0, y1: 855.0 }
  ],
  4: [
    { x0: 18.0, y0: 127.0, x1: 45.0, y1: 149.0 },
    { x0: 18.0, y0: 364.0, x1: 43.0, y1: 388.0 },
    { x0: 18.0, y0: 602.0, x1: 43.0, y1: 626.0 },
    { x0: 18.0, y0: 852.0, x1: 43.0, y1: 875.0 }
  ],
  5: [
    { x0: 18.0, y0: 123.0, x1: 43.0, y1: 147.0 },
    { x0: 18.0, y0: 221.0, x1: 42.0, y1: 244.0 },
    { x0: 18.0, y0: 470.0, x1: 42.0, y1: 493.0 },
    { x0: 18.0, y0: 657.0, x1: 44.0, y1: 680.0 },
    { x0: 18.0, y0: 863.0, x1: 43.0, y1: 885.0 }
  ],
  6: [
    { x0: 18.0, y0: 51.0, x1: 42.0, y1: 73.0 }
  ],
  7: [
    { x0: 18.0, y0: 116.0, x1: 43.0, y1: 140.0 },
    { x0: 18.0, y0: 299.0, x1: 44.0, y1: 323.0 },
    { x0: 18.0, y0: 496.0, x1: 42.0, y1: 519.0 }
  ],
  8: [
    { x0: 18.0, y0: 629.0, x1: 43.0, y1: 652.0 },
    { x0: 18.0, y0: 738.0, x1: 43.0, y1: 761.0 },
    { x0: 18.0, y0: 896.0, x1: 43.0, y1: 920.0 }
  ],
  9: [
    { x0: 18.0, y0: 59.0, x1: 45.0, y1: 82.0 },
    { x0: 18.0, y0: 216.0, x1: 42.0, y1: 239.0 },
    { x0: 18.0, y0: 360.0, x1: 43.0, y1: 383.0 }
  ],
  10: [],
  11: [],
  12: [
    { x0: 18.0, y0: 269.0, x1: 44.0, y1: 292.0 },
    { x0: 18.0, y0: 516.0, x1: 44.0, y1: 539.0 },
    { x0: 18.0, y0: 811.0, x1: 43.0, y1: 835.0 }
  ],
  13: [
    { x0: 18.0, y0: 120.0, x1: 43.0, y1: 144.0 },
    { x0: 18.0, y0: 369.0, x1: 43.0, y1: 393.0 },
    { x0: 18.0, y0: 511.0, x1: 44.0, y1: 534.0 },
    { x0: 18.0, y0: 863.0, x1: 45.0, y1: 886.0 },
    { x0: 18.0, y0: 956.0, x1: 43.0, y1: 979.0 }
  ],
  14: [
    { x0: 18.0, y0: 104.0, x1: 44.0, y1: 128.0 },
    { x0: 18.0, y0: 246.0, x1: 44.0, y1: 269.0 },
    { x0: 18.0, y0: 349.0, x1: 43.0, y1: 373.0 },
    { x0: 18.0, y0: 496.0, x1: 44.0, y1: 520.0 },
    { x0: 18.0, y0: 641.0, x1: 44.0, y1: 663.0 },
    { x0: 18.0, y0: 890.0, x1: 43.0, y1: 914.0 }
  ],
  15: [
    { x0: 18.0, y0: 54.0, x1: 43.0, y1: 76.0 },
    { x0: 18.0, y0: 160.0, x1: 45.0, y1: 183.0 },
    { x0: 18.0, y0: 253.0, x1: 44.0, y1: 276.0 },
    { x0: 18.0, y0: 352.0, x1: 43.0, y1: 376.0 },
    { x0: 18.0, y0: 555.0, x1: 42.0, y1: 578.0 }
  ],
  16: [
    { x0: 18.0, y0: 292.0, x1: 43.0, y1: 315.0 }
  ]
};

const playButtonsPerPage = [4, 3, 5, 4, 5, 1, 3, 3, 3, 0, 0, 3, 5, 6, 5, 1];

export const PDFViewerScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const playMantra = usePlayerStore((state) => state.playMantra);
  const { hasActiveSubscription } = useAuthStore();
  
  const { title, bookId, chapterId, pdfUrl } = route.params || {};
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(chapterId || null);
  const [bookDetails, setBookDetails] = useState<BookData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [flatMantras, setFlatMantras] = useState<any[]>([]);
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [isPremiumLocked, setIsPremiumLocked] = useState(false);
  const [showChaptersMenu, setShowChaptersMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Dynamically calculate start and end pages for all chapters using mantras count
  const chaptersWithPages = React.useMemo(() => {
    if (!chapters.length) return [];

    const totalPages = pageImages.length || 16;
    const numChapters = chapters.length;

    // Check if any chapter has valid mantras_count from API
    const hasRealCounts = chapters.some((ch) => (ch.mantras_count || 0) > 0);

    if (hasRealCounts) {
      const result: Array<ChapterData & { startPage: number; endPage: number }> = [];
      let currentP = 1;

      chapters.forEach((ch) => {
        const startPage = currentP;
        let mantrasAccumulated = 0;
        const targetCount = ch.mantras_count || 0;

        if (targetCount === 0) {
          result.push({ ...ch, startPage, endPage: startPage });
          return;
        }

        while (mantrasAccumulated < targetCount && currentP <= totalPages) {
          mantrasAccumulated += playButtonsPerPage[currentP - 1] || 0;
          currentP++;
        }

        const endPage = Math.max(startPage, currentP - 1);
        result.push({ ...ch, startPage, endPage });
      });

      return result;
    }

    // Fallback: divide total pages evenly among chapters
    const pagesPerChapter = Math.max(1, Math.floor(totalPages / numChapters));
    return chapters.map((ch, idx) => {
      const startPage = idx * pagesPerChapter + 1;
      const endPage = idx === numChapters - 1 ? totalPages : (idx + 1) * pagesPerChapter;
      return {
        ...ch,
        startPage,
        endPage,
      };
    });
  }, [chapters]);

  const activeChapterIndex = React.useMemo(() => {
    if (chaptersWithPages.length === 0) return 0;
    if (selectedChapterId) {
      const foundIdx = chaptersWithPages.findIndex((c) => String(c.id) === String(selectedChapterId));
      if (foundIdx !== -1) return foundIdx;
    }
    // Find range match fallback
    const foundIdx = chaptersWithPages.findIndex(
      (ch, i) => {
        const nextCh = chaptersWithPages[i + 1];
        if (nextCh) {
          return currentPage >= ch.startPage && currentPage < nextCh.startPage;
        }
        return currentPage >= ch.startPage;
      }
    );
    if (foundIdx !== -1) return foundIdx;
    return 0;
  }, [currentPage, chaptersWithPages, selectedChapterId]);

  const activeChapter = chaptersWithPages[activeChapterIndex] || null;

  // Auto-scroll to selected chapter's page if chapterId is passed
  const hasScrolledToInitialChapter = useRef(false);
  useEffect(() => {
    if (!chapterId || !chaptersWithPages.length || hasScrolledToInitialChapter.current) return;

    const targetCh = chaptersWithPages.find((ch) => String(ch.id) === String(chapterId));
    if (targetCh && targetCh.startPage) {
      hasScrolledToInitialChapter.current = true;
      setSelectedChapterId(targetCh.id);
      setTimeout(() => {
        navigateToPage(targetCh.startPage);
      }, 200);
    }
  }, [chapterId, chaptersWithPages]);

  const handleOpenReader = () => {
    const activeCh = chaptersWithPages[activeChapterIndex] || chaptersWithPages[0];

    if (activeCh) {
      navigation.navigate('Reader', {
        bookId: bookId,
        chapterId: activeCh.id,
        verseIndex: 0
      });
    } else {
      Alert.alert('Loading', 'Chapters list is loading, please try again in a moment...');
    }
  };

  // Check premium status on mount
  useEffect(() => {
    if (!bookId) {
      setLoading(false);
      return;
    }

    const checkPremiumLock = async () => {
      try {
        const bookData = await apiService.library.getBook(bookId);
        setBookDetails(bookData);
        if (bookData.is_premium && !hasActiveSubscription) {
          setIsPremiumLocked(true);
        }
      } catch (err) {
        console.warn('Failed to verify premium status, running in guest/offline mode:', err);
      } finally {
        setLoading(false);
      }
    };

    checkPremiumLock();
  }, [bookId]);

  // Load all mantras inside the book dynamically to map to the play triggers
  useEffect(() => {
    if (!bookId) return;

    const loadBookMantras = async () => {
      try {
        const chaptersList = await apiService.library.getBookChapters(bookId);
        setChapters(chaptersList);
        
        // Fetch all mantras in parallel across chapters
        const mantrasPromises = chaptersList.map(ch => 
          apiService.library.getChapterMantras(ch.id)
            .then(mantras => mantras.map(m => ({
              ...m,
              chapterTitle: ch.title,
              chapterDuration: ch.estimated_duration,
              chapterThumbnail: ch.thumbnail
            })))
            .catch(() => [])
        );
        
        const results = await Promise.all(mantrasPromises);
        const flattened = results.flat();
        setFlatMantras(flattened);
        console.log(`Loaded ${flattened.length} mantras for book ${bookId} to support interactive PDF play triggers.`);
      } catch (err) {
        console.warn('Failed to pre-load book mantras for PDF interaction:', err);
      }
    };

    loadBookMantras();
  }, [bookId]);

  const handlePlayMantra = async (pageNum: number, indexOnPage: number) => {
    // Calculate flat index
    let flatIndex = 0;
    for (let i = 0; i < pageNum - 1; i++) {
      flatIndex += playButtonsPerPage[i] || 0;
    }
    flatIndex += (indexOnPage - 1);

    console.log(`PDF trigger play: page ${pageNum}, index ${indexOnPage} -> flatIndex ${flatIndex}`);

    if (flatMantras.length === 0) {
      Alert.alert('Loading', 'Pre-loading scripture mantras, please try again in a moment...');
      return;
    }

    const targetIndex = Math.min(flatIndex, flatMantras.length - 1);
    if (targetIndex < 0) {
      Alert.alert('Not Available', 'No audio recitations are available for this scripture yet.');
      return;
    }

    const mantraData = flatMantras[targetIndex];
    const audioUrl = mantraData.audio?.audio_file_url || mantraData.audio?.audio_file || '';
    
    if (!audioUrl) {
      Alert.alert('Not Available', 'Audio recitation for this verse is not loaded.');
      return;
    }

    const dynamicCover = mantraData.chapterThumbnail || bookDetails?.cover_image_url || bookDetails?.cover_image || '';

    const mantraTrack = {
      id: mantraData.id,
      title: mantraData.title,
      deity: bookDetails?.title || title || 'Scripture Chants',
      category: 'Audiobooks',
      language: bookDetails?.language || 'Sanskrit',
      duration: mantraData.audio?.duration || 120,
      cover: dynamicCover ? { uri: dynamicCover } : require('../../assets/images/brahmpath_main.png'),
      audio: audioUrl,
      lyrics: {
        id: mantraData.id,
        language: 'Sanskrit',
        verses: [
          {
            start: parseFloat(String(mantraData.audio?.start_time || 0)),
            end: parseFloat(String(mantraData.audio?.end_time || 120)),
            text: mantraData.sanskrit_text,
            translation: mantraData.english_text
          }
        ]
      }
    };

    try {
      await playMantra(mantraTrack);
      Alert.alert('Playing Recitation', `${mantraData.title}`);
    } catch (err) {
      console.warn('Failed to play mantra from PDF trigger:', err);
      Alert.alert('Error', 'Failed to play the selected audio recitation.');
    }
  };

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.height;
    const offset = event.nativeEvent.contentOffset.y;
    const page = Math.floor(offset / slideSize) + 1;
    if (page > 0 && page <= pageImages.length) {
      setCurrentPage(page);
    }
  };

  const navigateToPage = (target: number) => {
    if (target >= 1 && target <= pageImages.length) {
      try {
        flatListRef.current?.scrollToIndex({ index: target - 1, animated: true });
      } catch (e) {
        flatListRef.current?.scrollToOffset({ offset: (target - 1) * containerHeight, animated: true });
      }
      setCurrentPage(target);
    }
  };

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const containerWidth = screenWidth;
  const containerHeight = screenHeight - 160; // Leave space for header & bottom navigation paging bar

  // Calculate size of letterboxed image
  const imgWidth = 612;
  const imgHeight = 1008;
  const imgAspectRatio = imgWidth / imgHeight;
  const containerAspectRatio = containerWidth / containerHeight;

  let displayedWidth = 0;
  let displayedHeight = 0;
  let offsetLeft = 0;
  let offsetTop = 0;

  if (containerAspectRatio < imgAspectRatio) {
    displayedWidth = containerWidth;
    displayedHeight = containerWidth / imgAspectRatio;
    offsetTop = (containerHeight - displayedHeight) / 2;
  } else {
    displayedHeight = containerHeight;
    displayedWidth = containerHeight * imgAspectRatio;
    offsetLeft = (containerWidth - displayedWidth) / 2;
  }

  const renderPageItem = ({ item, index }: { item: any; index: number }) => {
    const pageNum = index + 1;
    const links = pageLinks[pageNum] || [];

    return (
      <View style={{ width: screenWidth, height: containerHeight, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: containerWidth, height: containerHeight, position: 'relative' }}>
          <Image
            source={item}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
          {/* Absolute interactive tap-to-play buttons */}
          {links.map((link, idx) => {
            const btnLeft = offsetLeft + (link.x0 / imgWidth) * displayedWidth;
            const btnTop = offsetTop + (link.y0 / imgHeight) * displayedHeight;
            const btnW = ((link.x1 - link.x0) / imgWidth) * displayedWidth;
            const btnH = ((link.y1 - link.y0) / imgHeight) * displayedHeight;

            return (
              <Pressable
                key={idx}
                onPress={() => handlePlayMantra(pageNum, idx + 1)}
                style={{
                  position: 'absolute',
                  left: btnLeft - 4, // expand tap target slightly
                  top: btnTop - 4,
                  width: btnW + 8,
                  height: btnH + 8,
                  backgroundColor: 'rgba(45, 90, 39, 0.05)', // very faint green overlay
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: 'rgba(45, 90, 39, 0.25)', // slight border overlay
                }}
              />
            );
          })}
        </View>
      </View>
    );
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

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2] dark:bg-[#120E0D]" edges={['top', 'left', 'right']}>
      {/* Header Bar */}
      <View className="h-16 flex-row items-center justify-between px-4 border-b border-[#E6DFD3] dark:border-[#2D221F] bg-[#FAF7F2] dark:bg-[#120E0D]">
        <View className="flex-row items-center flex-1 mr-2">
          <Pressable
            onPress={() => navigation.goBack()}
            className="p-2 -ml-2 rounded-full active:bg-[#E6DFD3]/40 dark:active:bg-[#2D221F]/40"
          >
            <ArrowLeft size={24} color={isDark ? '#E6DFD3' : '#7A1E1E'} />
          </Pressable>
          <Text
            numberOfLines={1}
            className="ml-2 text-lg font-bold text-[#3A2E2B] dark:text-[#E6DFD3] font-inter flex-shrink"
          >
            {title || 'Scripture Book'}
          </Text>
        </View>

        <View className="flex-row items-center space-x-2">
          {/* Text Reader Switch */}
          <Pressable
            onPress={handleOpenReader}
            className="p-2 rounded-full active:bg-[#E6DFD3]/40 dark:active:bg-[#2D221F]/40"
          >
            <BookOpen size={20} color={isDark ? '#E6DFD3' : '#7A1E1E'} />
          </Pressable>

          <View className="bg-[#2D5A27] px-3 py-1.5 rounded-full">
            <Text className="text-white text-xs font-bold font-inter">
              {currentPage} / {pageImages.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Chapters Horizontal Scrollable Row (peels in the top navbar area) */}
      {chaptersWithPages.length > 0 && (
        <View className="py-2.5 bg-[#FAF7F2] dark:bg-[#120E0D] border-b border-[#E6DFD3] dark:border-[#2D221F]">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {chaptersWithPages.map((ch, idx) => {
              const startPage = ch.startPage;
              const isActive = idx === activeChapterIndex;

              return (
                <Pressable
                  key={ch.id}
                  onPress={() => {
                    setSelectedChapterId(ch.id);
                    navigateToPage(startPage);
                  }}
                  style={{
                    marginRight: 10,
                    paddingHorizontal: 16,
                    paddingVertical: 6,
                    borderRadius: 9999,
                    borderWidth: 1,
                    borderColor: isActive ? '#2D5A27' : (isDark ? '#3A2A25' : '#E2D9C8'),
                    backgroundColor: isActive ? '#2D5A27' : (isDark ? '#1C1513' : '#F5EFE6'),
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 'bold',
                      fontFamily: 'Inter_600SemiBold',
                      color: isActive ? '#FFFFFF' : (isDark ? '#E6DFD3' : '#7A1E1E')
                    }}
                  >
                    {ch.title}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Flipbook Horizontal Slider Container */}
      <View style={{ height: containerHeight }}>
        <FlatList
          ref={flatListRef}
          data={pageImages}
          renderItem={renderPageItem}
          keyExtractor={(_, i) => String(i)}
          horizontal={false}
          pagingEnabled={true}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          getItemLayout={(_, index) => ({
            length: containerHeight,
            offset: containerHeight * index,
            index,
          })}
        />
      </View>

      {/* Paging Footer navigation controls */}
      <View className="h-16 border-t border-[#E6DFD3] dark:border-[#2D221F] bg-[#FAF7F2] dark:bg-[#120E0D] flex-row items-center justify-between px-6">
        <Pressable
          disabled={currentPage === 1}
          onPress={() => navigateToPage(currentPage - 1)}
          className={`p-2 rounded-full ${currentPage === 1 ? 'opacity-30' : 'active:bg-[#E6DFD3]/40 dark:active:bg-[#2D221F]/40'}`}
        >
          <ChevronLeft size={24} color={isDark ? '#E6DFD3' : '#7A1E1E'} />
        </Pressable>

        <Text className="text-xs text-neutral-500 font-inter font-medium uppercase tracking-wide">
          Swipe up/down to turn pages
        </Text>

        <Pressable
          disabled={currentPage === pageImages.length}
          onPress={() => navigateToPage(currentPage + 1)}
          className={`p-2 rounded-full ${currentPage === pageImages.length ? 'opacity-30' : 'active:bg-[#E6DFD3]/40 dark:active:bg-[#2D221F]/40'}`}
        >
          <ChevronRight size={24} color={isDark ? '#E6DFD3' : '#7A1E1E'} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default PDFViewerScreen;
