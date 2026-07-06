import { TrackData, AudioServiceListeners, PlaybackState } from './audioServiceTypes';

// Register the headless playback service for Android background audio.
// This MUST be called before registerRootComponent in index.ts but we export it
// here so it can be called at app entry. On iOS/Web this is a no-op.
export function registerBackgroundService() {
  try {
    const TrackPlayer = require('react-native-track-player').default;
    const { registerPlaybackService } = require('react-native-track-player');
    registerPlaybackService(() => async () => {
      // Headless service handler — keeps audio session alive on Android
    });
  } catch {
    // Not available on web or when RNTP isn't available
  }
}

class NativeAudioEngine {
  private listeners: AudioServiceListeners = {};
  private initialized = false;
  private progressInterval: any = null;
  private currentTrackDuration = 0;

  setListeners(listeners: AudioServiceListeners) {
    this.listeners = listeners;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const TrackPlayer = require('react-native-track-player').default;
      const { AppKilledPlaybackBehavior, Capability } = require('react-native-track-player');

      await TrackPlayer.setupPlayer({});

      await TrackPlayer.updateOptions({
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        },
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
        ],
        compactCapabilities: [Capability.Play, Capability.Pause],
      });

      this.setupNativeEventListeners();
      this.initialized = true;
    } catch (e) {
      console.error('Failed to initialize react-native-track-player', e);
    }
  }

  private setupNativeEventListeners() {
    const TrackPlayer = require('react-native-track-player').default;
    const { Event, State } = require('react-native-track-player');

    TrackPlayer.addEventListener(Event.PlaybackState, ({ state }: any) => {
      // Use State enum values for reliable comparison across RNTP versions
      if (state === State.Playing) {
        this.listeners.onStateChange?.('playing');
        this.startProgressPolling();
      } else if (state === State.Paused || state === State.Stopped || state === State.Ready) {
        this.listeners.onStateChange?.('paused');
        this.stopProgressPolling();
      } else if (state === State.Buffering || state === State.Loading) {
        this.listeners.onStateChange?.('buffering');
      } else if (state === State.Ended) {
        this.listeners.onStateChange?.('ended');
        this.stopProgressPolling();
      } else {
        this.listeners.onStateChange?.('idle');
        this.stopProgressPolling();
      }
    });

    TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
      this.listeners.onTrackEnded?.();
    });
  }

  async play(track: TrackData): Promise<void> {
    await this.initialize();
    
    const TrackPlayer = require('react-native-track-player').default;
    this.currentTrackDuration = track.duration;

    await TrackPlayer.reset();
    await TrackPlayer.add({
      id: track.id,
      url: track.url,
      title: track.title,
      artist: track.artist,
      artwork: track.artwork,
      duration: track.duration,
    });

    await TrackPlayer.play();
  }

  async pause(): Promise<void> {
    const TrackPlayer = require('react-native-track-player').default;
    await TrackPlayer.pause();
  }

  async resume(): Promise<void> {
    const TrackPlayer = require('react-native-track-player').default;
    await TrackPlayer.play();
  }

  async stop(): Promise<void> {
    const TrackPlayer = require('react-native-track-player').default;
    await TrackPlayer.stop();
    this.stopProgressPolling();
  }

  async seek(seconds: number): Promise<void> {
    const TrackPlayer = require('react-native-track-player').default;
    await TrackPlayer.seekTo(seconds);
  }

  async setSpeed(speed: number): Promise<void> {
    const TrackPlayer = require('react-native-track-player').default;
    await TrackPlayer.setRate(speed);
  }

  private startProgressPolling() {
    this.stopProgressPolling();
    const TrackPlayer = require('react-native-track-player').default;

    this.progressInterval = setInterval(async () => {
      try {
        // getProgress() is the non-deprecated API in RNTP v4+
        const progress = await TrackPlayer.getProgress();
        this.listeners.onProgress?.(
          progress.position,
          progress.duration || this.currentTrackDuration
        );
      } catch {}
    }, 250);
  }

  private stopProgressPolling() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }
}

export const audioService = new NativeAudioEngine();
export * from './audioServiceTypes';
