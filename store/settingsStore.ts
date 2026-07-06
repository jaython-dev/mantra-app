import { create } from 'zustand';
import { storage } from '../services/storage/storageService';

export interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'hi';
  playbackSpeed: number;
  repeatTarget: number; // 11 | 21 | 108 | -1 (Loop)
  sleepTimer: number; // minutes, 0 means inactive
  notifications: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (lang: 'en' | 'hi') => void;
  setPlaybackSpeed: (speed: number) => void;
  setRepeatTarget: (count: number) => void;
  setSleepTimer: (minutes: number) => void;
  setNotifications: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: (storage.getString('theme') as any) || 'system',
  language: (storage.getString('language') as any) || 'en',
  playbackSpeed: storage.getNumber('playbackSpeed') || 1.0,
  repeatTarget: storage.getNumber('repeatTarget') || 108, // Spiritual default target count
  sleepTimer: 0, // Keep in memory to prevent stale timers on app reload
  notifications: storage.getBoolean('notifications') ?? true,

  setTheme: (theme) => {
    storage.set('theme', theme);
    set({ theme });
  },
  setLanguage: (language) => {
    storage.set('language', language);
    set({ language });
  },
  setPlaybackSpeed: (playbackSpeed) => {
    storage.set('playbackSpeed', playbackSpeed);
    set({ playbackSpeed });
  },
  setRepeatTarget: (repeatTarget) => {
    storage.set('repeatTarget', repeatTarget);
    set({ repeatTarget });
  },
  setSleepTimer: (sleepTimer) => {
    set({ sleepTimer });
  },
  setNotifications: (notifications) => {
    storage.set('notifications', notifications);
    set({ notifications });
  },
}));
