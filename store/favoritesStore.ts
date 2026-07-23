import { create } from 'zustand';
import { dbService } from '../services/db/dbService';
import { storage } from '../services/storage/storageService';

export interface FavoritesState {
  favorites: string[]; // List of mantra IDs
  recentlyPlayed: string[]; // List of recently played mantra IDs
  bookmarkedChapters: string[]; // List of bookmarked chapter IDs
  downloadedChapters: string[]; // List of downloaded chapter IDs
  activeBookProgress: Record<string, { chapterId: string; verseIndex: number }>; // Tracks reading progress: { bookId: { chapterId, verseIndex } }
  lastReadBookId: string | null; // Last book ID read for continue reading card
  
  // Dashboard statistics
  streakDays: number;
  readHours: number;
  completedBooks: number;
  mantrasChanted: number;
  streakMap: boolean[];
  fetchDashboardStats: () => Promise<void>;

  fetchFavorites: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  addHistory: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
  
  // Chapter & Progress actions
  toggleChapterBookmark: (chapterId: string) => void;
  toggleChapterDownload: (chapterId: string) => void;
  updateBookProgress: (bookId: string, chapterId: string, verseIndex: number) => void;
  isChapterBookmarked: (chapterId: string) => boolean;
  isChapterDownloaded: (chapterId: string) => boolean;
}

// Load persisted data helper
const getPersistedArray = (key: string): string[] => {
  try {
    const data = storage.getString(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const getPersistedObject = <T>(key: string, defaultValue: T): T => {
  try {
    const data = storage.getString(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  recentlyPlayed: [],
  bookmarkedChapters: getPersistedArray('bookmarkedChapters'),
  downloadedChapters: getPersistedArray('downloadedChapters'),
  activeBookProgress: getPersistedObject('activeBookProgress', {}),
  lastReadBookId: storage.getString('lastReadBookId') || null,

  // Dashboard statistics
  streakDays: 0,
  readHours: 0.0,
  completedBooks: 0,
  mantrasChanted: 0,
  streakMap: Array(14).fill(false),

  fetchDashboardStats: async () => {
    try {
      const total = await dbService.getChantedCount();
      const streak = await dbService.getChantStreak();
      const dates = await dbService.getChantedDates();

      // Estimate hours (120 seconds per chant)
      const hours = parseFloat(((total * 120) / 3600).toFixed(1));

      // Unique books read from progress tracking
      const progress = get().activeBookProgress;
      const completedBooksCount = Object.keys(progress).length;

      // Consistency calendar mapping (last 14 days)
      const streakMap = Array(14).fill(false);
      const today = new Date();
      for (let i = 0; i < 14; i++) {
        const checkDate = new Date();
        checkDate.setDate(today.getDate() - i);
        const checkDateStr = checkDate.toISOString().split('T')[0];
        if (dates.includes(checkDateStr)) {
          streakMap[i] = true;
        }
      }

      set({
        mantrasChanted: total,
        streakDays: streak,
        readHours: hours,
        completedBooks: completedBooksCount,
        streakMap: streakMap,
      });
    } catch (e) {
      console.error('Failed to load dashboard stats', e);
    }
  },

  fetchFavorites: async () => {
    try {
      const favs = await dbService.getFavorites();
      set({ favorites: favs });
    } catch (e) {
      console.error('Failed to fetch favorites', e);
    }
  },

  fetchHistory: async () => {
    try {
      const history = await dbService.getHistory(15);
      set({ recentlyPlayed: history });
      await get().fetchDashboardStats();
    } catch (e) {
      console.error('Failed to fetch history', e);
    }
  },

  toggleFavorite: async (id) => {
    const { favorites } = get();
    const isFav = favorites.includes(id);
    try {
      if (isFav) {
        await dbService.removeFavorite(id);
        set({ favorites: favorites.filter(x => x !== id) });
      } else {
        await dbService.addFavorite(id);
        set({ favorites: [...favorites, id] });
      }
    } catch (e) {
      console.error('Failed to toggle favorite', e);
    }
  },

  addHistory: async (id) => {
    try {
      await dbService.addHistory(id);
      const history = await dbService.getHistory(15);
      set({ recentlyPlayed: history });
      await get().fetchDashboardStats();
    } catch (e) {
      console.error('Failed to add to history', e);
    }
  },

  isFavorite: (id) => {
    return get().favorites.includes(id);
  },

  toggleChapterBookmark: (chapterId) => {
    const list = get().bookmarkedChapters;
    const newList = list.includes(chapterId)
      ? list.filter(x => x !== chapterId)
      : [...list, chapterId];
    
    storage.set('bookmarkedChapters', JSON.stringify(newList));
    set({ bookmarkedChapters: newList });
  },

  toggleChapterDownload: (chapterId) => {
    const list = get().downloadedChapters;
    const newList = list.includes(chapterId)
      ? list.filter(x => x !== chapterId)
      : [...list, chapterId];
    
    storage.set('downloadedChapters', JSON.stringify(newList));
    set({ downloadedChapters: newList });
  },

  updateBookProgress: (bookId, chapterId, verseIndex) => {
    const progress = { ...get().activeBookProgress };
    progress[bookId] = { chapterId, verseIndex };
    
    storage.set('activeBookProgress', JSON.stringify(progress));
    storage.set('lastReadBookId', bookId);
    
    set({
      activeBookProgress: progress,
      lastReadBookId: bookId
    });
  },

  isChapterBookmarked: (chapterId) => {
    return get().bookmarkedChapters.includes(chapterId);
  },

  isChapterDownloaded: (chapterId) => {
    return get().downloadedChapters.includes(chapterId);
  },
}));
