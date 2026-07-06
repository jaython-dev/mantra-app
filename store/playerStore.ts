import { create } from 'zustand';
import { audioService, TrackData } from '../services/audio/audioService';
import { Mantra, MANTRAS } from '../utils/mantraData';
import { useFavoritesStore } from './favoritesStore';
import { useSettingsStore } from './settingsStore';

export interface PlayerState {
  currentMantra: Mantra | null;
  playbackState: 'idle' | 'playing' | 'paused' | 'buffering' | 'ended';
  position: number; // in seconds
  duration: number; // in seconds
  playbackSpeed: number;
  repeatMode: 'off' | 'one' | 'all';
  repeatCount: number; // current repetition count in the session
  sleepTimerLeft: number; // remaining seconds
  activeLyricIndex: number;
  isFullPlayerOpen: boolean;
  
  // Actions
  initAudioService: () => Promise<void>;
  playMantra: (mantra: Mantra) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  seek: (seconds: number) => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  setPlaybackSpeed: (speed: number) => Promise<void>;
  setRepeatMode: (mode: 'off' | 'one' | 'all') => void;
  resetRepeatCount: () => void;
  startSleepTimer: (minutes: number) => void;
  stopSleepTimer: () => void;
  updateProgress: (position: number, duration: number) => void;
  setFullPlayerOpen: (open: boolean) => void;
}

let sleepTimerInterval: any = null;

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentMantra: null,
  playbackState: 'idle',
  position: 0,
  duration: 0,
  playbackSpeed: 1.0,
  repeatMode: 'all',
  repeatCount: 0,
  sleepTimerLeft: 0,
  activeLyricIndex: -1,
  isFullPlayerOpen: false,

  setFullPlayerOpen: (open: boolean) => set({ isFullPlayerOpen: open }),

  initAudioService: async () => {
    // Sync speed from settings
    const speed = useSettingsStore.getState().playbackSpeed;
    set({ playbackSpeed: speed });
    
    audioService.setListeners({
      onProgress: (pos, dur) => {
        get().updateProgress(pos, dur);
      },
      onStateChange: (state) => {
        set({ playbackState: state });
      },
      onTrackEnded: () => {
        const { repeatMode, currentMantra, repeatCount } = get();
        const target = useSettingsStore.getState().repeatTarget;

        if (repeatMode === 'one' && currentMantra) {
          const nextCount = repeatCount + 1;
          set({ repeatCount: nextCount });
          
          if (target > 0 && nextCount >= target) {
            // Target repetition reached! Stop playback.
            set({ repeatCount: 0 });
            audioService.stop();
          } else {
            // Repeat again
            get().playMantra(currentMantra);
          }
        } else {
          // Play next in queue
          get().next();
        }
      }
    });

    await audioService.initialize();
  },

  playMantra: async (mantra) => {
    set({ currentMantra: mantra, position: 0, activeLyricIndex: -1 });
    
    // Add to history database
    useFavoritesStore.getState().addHistory(mantra.id);

    const track: TrackData = {
      id: mantra.id,
      url: mantra.audio,
      title: mantra.title,
      artist: mantra.deity,
      artwork: mantra.cover,
      duration: mantra.duration,
    };

    await audioService.play(track);
    // Apply speed settings
    await audioService.setSpeed(get().playbackSpeed);
  },

  pause: async () => {
    await audioService.pause();
  },

  resume: async () => {
    const { currentMantra } = get();
    if (currentMantra) {
      await audioService.resume();
    }
  },

  seek: async (seconds) => {
    await audioService.seek(seconds);
  },

  next: async () => {
    const { currentMantra } = get();
    if (!currentMantra) return;
    const currentIndex = MANTRAS.findIndex(m => m.id === currentMantra.id);
    const nextIndex = (currentIndex + 1) % MANTRAS.length;
    await get().playMantra(MANTRAS[nextIndex]);
  },

  previous: async () => {
    const { currentMantra } = get();
    if (!currentMantra) return;
    const currentIndex = MANTRAS.findIndex(m => m.id === currentMantra.id);
    const prevIndex = (currentIndex - 1 + MANTRAS.length) % MANTRAS.length;
    await get().playMantra(MANTRAS[prevIndex]);
  },

  setPlaybackSpeed: async (speed) => {
    set({ playbackSpeed: speed });
    useSettingsStore.getState().setPlaybackSpeed(speed);
    await audioService.setSpeed(speed);
  },

  setRepeatMode: (mode) => {
    set({ repeatMode: mode });
  },

  resetRepeatCount: () => {
    set({ repeatCount: 0 });
  },

  startSleepTimer: (minutes) => {
    get().stopSleepTimer();
    
    if (minutes <= 0) return;

    set({ sleepTimerLeft: minutes * 60 });
    useSettingsStore.getState().setSleepTimer(minutes);

    sleepTimerInterval = setInterval(() => {
      const { sleepTimerLeft, pause } = get();
      if (sleepTimerLeft <= 1) {
        get().stopSleepTimer();
        pause();
      } else {
        set({ sleepTimerLeft: sleepTimerLeft - 1 });
      }
    }, 1000);
  },

  stopSleepTimer: () => {
    if (sleepTimerInterval) {
      clearInterval(sleepTimerInterval);
      sleepTimerInterval = null;
    }
    set({ sleepTimerLeft: 0 });
    useSettingsStore.getState().setSleepTimer(0);
  },

  updateProgress: (position, duration) => {
    const { currentMantra } = get();
    let activeLyricIndex = -1;

    if (currentMantra && currentMantra.lyrics && currentMantra.lyrics.verses) {
      const verses = currentMantra.lyrics.verses;
      // Find the active verse matching current position in seconds
      activeLyricIndex = verses.findIndex(
        (v: any) => position >= v.start && position < v.end
      );
    }

    set({
      position,
      duration: duration || currentMantra?.duration || 0,
      activeLyricIndex,
    });
  },
}));
