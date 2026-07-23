import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Share, Modal, TouchableOpacity, StyleSheet, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft, Bookmark, Search, Settings, Play, Pause, Share2, X, Sparkles, Check, ChevronRight, BookOpen } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, interpolateColor } from 'react-native-reanimated';
import { BOOKS, Book, Chapter, Verse } from '../../utils/mantraData';
import { useFavoritesStore } from '../../store/favoritesStore';
import { usePlayerStore } from '../../store/playerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { DividerDecoration } from '../../components/ui/DesignSystem';
import { apiService } from '../../services/api/apiService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ReaderScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { bookId, chapterId, verseIndex } = route.params || {};

  // Dynamic States
  const [bookDetails, setBookDetails] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [activeChapter, setActiveChapter] = useState<any>(null);
  const [selectedChapterId, setSelectedChapterId] = useState(chapterId);
  const [loading, setLoading] = useState(true);

  // States
  const [activeVerseIdx, setActiveVerseIdx] = useState(verseIndex || 0);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareVerse, setShareVerse] = useState<any | null>(null);

  // Custom Stores
  const { toggleChapterBookmark, isChapterBookmarked, updateBookProgress } = useFavoritesStore();
  const { currentMantra, playMantra, playbackState, position, pause, resume, seek } = usePlayerStore();
  const { fontSize, setFontSize, readerTheme, setReaderTheme } = useSettingsStore();
  const isDark = readerTheme === 'dark';

  // Scroll layouts for auto-centering
  const scrollRef = useRef<ScrollView>(null);
  const [verseOffsets, setVerseOffsets] = useState<Record<number, number>>({});

  // 1. Fetch Book Details and Chapters list on mount or bookId change
  useEffect(() => {
    const loadBookAndChapters = async () => {
      try {
        setLoading(true);
        const bookData = await apiService.library.getBook(bookId);
        setBookDetails(bookData);
        const chaptersList = await apiService.library.getBookChapters(bookId);
        setChapters(chaptersList);
        
        // Match initial chapter
        const targetChapter = chaptersList.find(c => c.id === selectedChapterId) || chaptersList[0];
        if (targetChapter) {
          setSelectedChapterId(targetChapter.id);
        }
      } catch (err) {
        console.warn('Failed to load book or chapters, falling back to local data:', err);
        const localBook = BOOKS.find((b) => b.id === bookId) || BOOKS[0];
        setBookDetails(localBook);
        setChapters(localBook.chapters);
        const localCh = localBook.chapters.find((c) => c.id === selectedChapterId) || localBook.chapters[0];
        if (localCh) {
          setSelectedChapterId(localCh.id);
        }
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      loadBookAndChapters();
    }
  }, [bookId]);

  // 2. Fetch active chapter mantras/verses whenever selectedChapterId changes
  useEffect(() => {
    if (!selectedChapterId) return;

    const loadChapterMantras = async () => {
      try {
        setLoading(true);
        // Find chapter metadata in loaded list
        const targetChapter = chapters.find(c => c.id === selectedChapterId);
        if (!targetChapter) return;

        // If local data fallback (local chapters already contain verses list)
        if (targetChapter.verses) {
          setActiveChapter(targetChapter);
          return;
        }

        const mantrasList = await apiService.library.getChapterMantras(selectedChapterId);
        const mappedChapter = {
          id: targetChapter.id,
          title: targetChapter.title,
          chapter_number: targetChapter.chapter_number,
          description: targetChapter.description,
          duration: targetChapter.estimated_duration,
          verses: mantrasList.map((m) => ({
            number: m.display_order || 1,
            text: m.sanskrit_text,
            transliteration: m.english_text,
            meaning: m.meaning,
            translation: m.notes,
            audioStart: m.audio?.start_time ? parseFloat(m.audio.start_time) : 0,
            audioEnd: m.audio?.end_time ? parseFloat(m.audio.end_time) : 20,
          }))
        };
        setActiveChapter(mappedChapter);
      } catch (err) {
        console.warn('Failed to load chapter mantras:', err);
      } finally {
        setLoading(false);
      }
    };

    loadChapterMantras();
  }, [selectedChapterId, chapters]);

  // Track player integration
  const isPlaying = playbackState === 'playing' && currentMantra?.id === activeChapter?.id;

  // Sync scroll position with player audio timestamps
  useEffect(() => {
    if (activeChapter && currentMantra?.id === activeChapter.id && activeChapter.verses) {
      const matchIndex = activeChapter.verses.findIndex(
        (v: any) => position >= (v.audioStart || 0) && position <= (v.audioEnd || 999)
      );
      if (matchIndex !== -1 && matchIndex !== activeVerseIdx) {
        setActiveVerseIdx(matchIndex);
        updateBookProgress(bookId, activeChapter.id, matchIndex);
      }
    }
  }, [position, currentMantra, activeChapter]);

  // Center active verse
  useEffect(() => {
    if (verseOffsets[activeVerseIdx] !== undefined) {
      scrollRef.current?.scrollTo({
        y: Math.max(0, verseOffsets[activeVerseIdx] - 100),
        animated: true,
      });
    }
  }, [activeVerseIdx, verseOffsets]);

  const handlePlayVerse = (verse: any, index: number) => {
    if (!activeChapter) return;
    setActiveVerseIdx(index);
    updateBookProgress(bookId, activeChapter.id, index);

    // If audio is already loaded, seek to its start time
    if (currentMantra?.id === activeChapter.id) {
      seek(verse.audioStart || 0);
      if (playbackState !== 'playing') resume();
    } else {
      // Play chapter audio
      const track = {
        id: activeChapter.id,
        title: activeChapter.title,
        deity: bookDetails?.title || 'Scripture Book',
        category: 'Audiobooks',
        language: bookDetails?.language || 'संस्कृत',
        duration: activeChapter.duration,
        cover: typeof bookDetails?.cover === 'number'
          ? bookDetails.cover
          : (bookDetails?.cover_image ? { uri: bookDetails.cover_image } : require('../../assets/images/brahmpath_main.png')),
        audio: activeChapter.audio,
        lyrics: {
          id: activeChapter.id,
          title: activeChapter.title,
          verses: activeChapter.verses.map((v: any) => ({
            start: v.audioStart || 0,
            end: v.audioEnd || 20,
            text: v.text,
            translation: v.translation,
          })),
        },
        description: activeChapter.description,
      };
      playMantra(track as any).then(() => {
        setTimeout(() => seek(verse.audioStart || 0), 400);
      });
    }
  };

  const handleShare = async (verse: any) => {
    setShareVerse(verse);
    setShowShareModal(true);
  };

  const triggerSystemShare = async () => {
    if (!shareVerse) return;
    try {
      await Share.share({
        message: `${shareVerse.text}\n\nTransliteration: ${shareVerse.transliteration}\n\nTranslation: ${shareVerse.translation}\n\nShared via Mantra & Audiobook App`,
      });
      setShowShareModal(false);
    } catch (e) {
      console.warn('Share failed', e);
    }
  };

  // Adjust screen variables according to reading theme settings
  const themeStyles = {
    parchment: {
      bg: 'bg-[#FAF7F2]',
      paper: 'bg-[#F4EFE3]',
      text: 'text-[#3A2E2B]',
      border: 'border-[#E6DFD3]',
      verseBg: 'bg-[#FFFDF9]',
      glowBorder: 'border-[#D4AF37]',
      glowBg: 'bg-[#FAF2DF]',
    },
    ivory: {
      bg: 'bg-[#FFFFFF]',
      paper: 'bg-[#FAF8F5]',
      text: 'text-[#2D2D2D]',
      border: 'border-[#EAE6DF]',
      verseBg: 'bg-[#FFFFFF]',
      glowBorder: 'border-[#E2C785]',
      glowBg: 'bg-[#FDF9F0]',
    },
    dark: {
      bg: 'bg-[#120E0D]',
      paper: 'bg-[#1C1513]',
      text: 'text-[#E6DFD3]',
      border: 'border-[#3A2A25]',
      verseBg: 'bg-[#18110F]',
      glowBorder: 'border-[#D4AF37]',
      glowBg: 'bg-[#2A1D1A]',
    },
  }[readerTheme];

  if (loading && !activeChapter) {
    return (
      <SafeAreaView className={`flex-1 bg-[#FAF7F2] dark:bg-[#120E0D] justify-center items-center`}>
        <ActivityIndicator size="large" color="#7A1E1E" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${themeStyles.bg}`}>
      {/* 1. Scripture AppBar Header */}
      <View className={`flex-row items-center justify-between px-4 py-3 border-b ${themeStyles.border} bg-[#FAF7F2] dark:bg-[#1C1513]`}>
        <View className="flex-row items-center flex-1 mr-2">
          <Pressable onPress={() => navigation.goBack()} className="p-1 rounded-full active:bg-neutral-200/50">
            <ArrowLeft size={22} color="#7A1E1E" />
          </Pressable>
          <View className="ml-3 flex-1">
            <Text numberOfLines={1} className="text-sm font-bold text-[#7A1E1E] dark:text-[#E6DFD3] font-inter">
              {bookDetails?.title || 'Scripture Book'}
            </Text>
            <Text numberOfLines={1} className="text-[10px] text-neutral-400 font-medium font-inter">
              {activeChapter?.title || 'Loading...'}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center space-x-3.5">
          {/* PDF Viewer Switch Button */}
          <Pressable onPress={() => navigation.goBack()} className="p-1">
            <BookOpen size={20} color="#7A1E1E" />
          </Pressable>

          {/* Bookmark Button */}
          <Pressable onPress={() => activeChapter && toggleChapterBookmark(activeChapter.id)} className="p-1">
            <Bookmark size={20} color={activeChapter && isChapterBookmarked(activeChapter.id) ? '#D4AF37' : '#7A1E1E'} fill={activeChapter && isChapterBookmarked(activeChapter.id) ? '#D4AF37' : 'transparent'} />
          </Pressable>

          {/* Settings Button */}
          <Pressable onPress={() => setShowSettingsModal(true)} className="p-1">
            <Settings size={20} color="#7A1E1E" />
          </Pressable>
        </View>
      </View>

      {/* 2. Scrollable Horizontal Chips (Book Chapters) */}
      <View className={`py-3.5 border-b ${themeStyles.border} bg-[#FAF7F2] dark:bg-[#1C1513]`}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {chapters.map((ch) => {
            const selected = String(selectedChapterId) === String(ch.id);
            return (
              <Pressable
                key={ch.id}
                onPress={() => {
                  setSelectedChapterId(ch.id);
                  setActiveVerseIdx(0);
                  updateBookProgress(bookId, ch.id, 0);
                }}
                className={`px-4.5 py-1.5 rounded-full mr-2.5 border ${
                  selected
                    ? 'bg-[#2D5A27] border-[#2D5A27]'
                    : 'bg-[#F5EFE6] dark:bg-[#1C1513] border-[#E2D9C8] dark:border-[#3A2A25]'
                }`}
              >
                <Text className={`text-[11px] font-bold font-inter ${selected ? 'text-white' : 'text-[#7A1E1E] dark:text-[#E6DFD3]'}`}>
                  {ch.title}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Parchment Scripture Reading Area */}
      <View className="flex-1 relative">
        {/* Floating Page Number indicator on right */}
        <View className="absolute right-0 top-12 bg-[#7A1E1E] py-2 px-3 rounded-l-xl z-10 border-l border-y border-[#D4AF37]">
          <Text className="text-[10px] text-white font-bold tracking-widest font-inter">
            {activeVerseIdx + 1} / {activeChapter?.verses?.length || 0}
          </Text>
        </View>

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          className={`${themeStyles.paper}`}
        >
          {/* Cover Art watermark badge top */}
          <View className="items-center mb-6 opacity-85">
            <Text className="text-[10px] uppercase font-bold text-[#8C7A6B] tracking-[0.2em] mb-2 font-inter text-center">
              {bookDetails?.title || 'Scripture Book'}
            </Text>
            <DividerDecoration />
          </View>

          {/* Verses Loop */}
          {(activeChapter?.verses || []).map((verse: any, idx: number) => {
            const isActive = idx === activeVerseIdx;
            
            return (
              <View
                key={verse.number}
                onLayout={(e) => {
                  const y = e.nativeEvent.layout.y;
                  setVerseOffsets((prev) => ({ ...prev, [idx]: y }));
                }}
                className={`mb-6 p-5 rounded-[20px] border ${
                  isActive
                    ? `${themeStyles.glowBorder} ${themeStyles.glowBg} shadow-md shadow-[#D4AF37]/10`
                    : `${themeStyles.border} ${themeStyles.verseBg}`
                }`}
                style={isActive ? { elevation: 3 } : undefined}
              >
                {/* Verse Header Info */}
                <View className="flex-row justify-between items-center mb-3">
                  <View className="bg-[#7A1E1E]/10 dark:bg-[#7A1E1E]/20 border border-[#7A1E1E]/20 px-3 py-0.5 rounded-full">
                    <Text className="text-[10px] font-bold text-[#7A1E1E] dark:text-[#E6DFD3] font-inter">
                      Verse {verse.number}
                    </Text>
                  </View>

                  <View className="flex-row items-center space-x-3">
                    {/* Individual Verse Controls */}
                    <Pressable onPress={() => handlePlayVerse(verse, idx)} className="p-1">
                      {isActive && isPlaying ? (
                        <Pause size={16} color="#7A1E1E" />
                      ) : (
                        <Play size={16} color="#7A1E1E" fill="#7A1E1E" />
                      )}
                    </Pressable>
                    <Pressable onPress={() => handleShare(verse)} className="p-1">
                      <Share2 size={15} color="#8C7A6B" />
                    </Pressable>
                  </View>
                </View>

                {/* Sanskrit Scripture text */}
                <Text
                  style={{ fontSize: fontSize, lineHeight: fontSize * 1.5 }}
                  className="font-bold text-center text-[#7A1E1E] dark:text-neutral-100 font-devanagari tracking-wide my-4"
                >
                  {verse.text}
                </Text>

                {/* English Transliteration */}
                {verse.transliteration && !verse.transliteration.toLowerCase().startsWith('mantra') && (
                  <Text className="text-xs italic text-[#8C7A6B] text-center font-inter leading-relaxed px-2 mb-4">
                    {verse.transliteration}
                  </Text>
                )}

                <View className="h-[0.5px] bg-[#E6DFD3] dark:bg-[#3A2A25] my-3.5" />

                {/* Word Meaning Table */}
                {verse.meaning && verse.translation && (
                  <View className="mb-4 bg-[#FAF7F2]/50 dark:bg-black/10 p-3.5 rounded-xl border border-[#E6DFD3]/40 dark:border-[#3A2A25]/40">
                    <Text className="text-[9px] uppercase font-bold text-[#8C7A6B] mb-2 tracking-wider font-inter">
                      Word Meanings
                    </Text>
                    <Text className="text-xs text-[#3A2E2B] dark:text-neutral-300 font-inter leading-relaxed">
                      {verse.meaning}
                    </Text>
                  </View>
                )}

                {/* Translation */}
                <View>
                  <Text className="text-[9px] uppercase font-bold text-[#8C7A6B] mb-1.5 tracking-wider font-inter">
                    Translation
                  </Text>
                  <Text className="text-sm text-[#3A2E2B] dark:text-neutral-200 font-inter leading-relaxed">
                    {verse.translation || verse.meaning}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* 4. Reader Settings Modal (Parchemnt Theme Selector, Font Size) */}
      <Modal visible={showSettingsModal} transparent animationType="fade">
        <Pressable onPress={() => setShowSettingsModal(false)} className="flex-1 bg-black/60 justify-end">
          <Pressable className="bg-[#FAF7F2] dark:bg-[#1C1513] rounded-t-[32px] border-t border-[#D4AF37] p-6 pb-10">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-lg font-bold text-[#7A1E1E] dark:text-[#FAF7F2] font-inter">
                Reading settings
              </Text>
              <Pressable onPress={() => setShowSettingsModal(false)} className="p-1 bg-[#7A1E1E]/5 rounded-full">
                <X size={20} color="#7A1E1E" />
              </Pressable>
            </View>

            {/* Font Size Adjuster */}
            <View className="mb-6">
              <Text className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 font-inter">
                Scripture text size
              </Text>
              <View className="flex-row items-center justify-between bg-white dark:bg-[#2A1E1C] border border-[#E6DFD3] dark:border-[#3D2C28] rounded-2xl p-4">
                <Pressable
                  onPress={() => setFontSize(Math.max(16, fontSize - 2))}
                  className="w-10 h-10 rounded-xl bg-[#7A1E1E]/5 items-center justify-center border border-[#7A1E1E]/15 active:scale-95"
                >
                  <Text className="text-sm font-bold text-[#7A1E1E]">-</Text>
                </Pressable>
                <Text className="text-sm font-bold text-[#3A2E2B] dark:text-neutral-200 font-inter">
                  {fontSize} px (Devanāgarī)
                </Text>
                <Pressable
                  onPress={() => setFontSize(Math.min(36, fontSize + 2))}
                  className="w-10 h-10 rounded-xl bg-[#7A1E1E]/5 items-center justify-center border border-[#7A1E1E]/15 active:scale-95"
                >
                  <Text className="text-sm font-bold text-[#7A1E1E]">+</Text>
                </Pressable>
              </View>
            </View>

            {/* Reading Themes */}
            <View className="mb-6">
              <Text className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 font-inter">
                Reading theme
              </Text>
              <View className="flex-row space-x-3">
                {(['parchment', 'ivory', 'dark'] as const).map((theme) => {
                  const selected = readerTheme === theme;
                  const themeLabel = { parchment: 'Parchment', ivory: 'Pure Ivory', dark: 'Temple Night' }[theme];
                  const themeColors = { parchment: 'bg-[#F4EFE3]', ivory: 'bg-[#FFFFFF] border-[#D4AF37]', dark: 'bg-[#1C1513]' }[theme];

                  return (
                    <Pressable
                      key={theme}
                      onPress={() => setReaderTheme(theme)}
                      className={`flex-1 p-4 rounded-2xl border items-center justify-center ${themeColors} ${
                        selected ? 'border-[#7A1E1E]' : 'border-[#E6DFD3] dark:border-[#3D2C28]'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold font-inter ${
                          theme === 'dark' ? 'text-[#FAF7F2]' : 'text-[#3A2E2B]'
                        }`}
                      >
                        {themeLabel}
                      </Text>
                      {selected && (
                        <View className="absolute bottom-2 right-2 bg-[#7A1E1E] rounded-full p-0.5 border border-white">
                          <Check size={8} color="white" />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 5. Custom Quote Share Frame generator Modal */}
      <Modal visible={showShareModal} transparent animationType="slide">
        <Pressable onPress={() => setShowShareModal(false)} className="flex-1 bg-black/70 justify-center items-center p-6">
          <Pressable className="bg-[#FAF7F2] border-2 border-[#D4AF37] rounded-[32px] w-full max-w-[340px] overflow-hidden p-6 shadow-2xl">
            {/* Card Frame Layout */}
            <View className="border border-[#7A1E1E]/20 p-4 rounded-2xl bg-[#FFFDF9] items-center relative">
              {/* Corner Ornaments */}
              <View className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37]" />
              <View className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37]" />
              <View className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#D4AF37]" />
              <View className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#D4AF37]" />

              <Sparkles size={20} color="#D4AF37" className="mb-2" />
              <Text className="text-center font-bold text-base text-[#7A1E1E] font-devanagari leading-normal mb-3">
                {shareVerse?.text}
              </Text>
              <Text className="text-[10px] text-[#8C7A6B] text-center font-inter mb-4">
                — {bookDetails?.title || 'Scripture Book'}, {activeChapter?.title || ''}
              </Text>
              
              <Text className="text-center text-xs text-neutral-500 font-inter leading-relaxed px-2">
                "{shareVerse?.translation}"
              </Text>
            </View>

            {/* Share action */}
            <View className="flex-row space-x-3 mt-6">
              <Pressable
                onPress={() => setShowShareModal(false)}
                className="flex-1 py-3 border border-[#E6DFD3] rounded-xl items-center"
              >
                <Text className="text-xs font-bold text-neutral-500 font-inter">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={triggerSystemShare}
                className="flex-1 py-3 bg-[#7A1E1E] border border-[#D4AF37] rounded-xl items-center"
              >
                <Text className="text-xs font-bold text-white font-inter">Share Verse</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Custom styles for edge cases if necessary
});

export default ReaderScreen;
