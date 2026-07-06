import { create } from 'zustand';
import { dbService } from '../services/db/dbService';

export interface FavoritesState {
  favorites: string[]; // List of mantra IDs
  recentlyPlayed: string[]; // List of recently played mantra IDs
  fetchFavorites: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  addHistory: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  recentlyPlayed: [],

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
    } catch (e) {
      console.error('Failed to add to history', e);
    }
  },

  isFavorite: (id) => {
    return get().favorites.includes(id);
  },
}));
