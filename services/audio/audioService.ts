import { TrackData, AudioServiceListeners, PlaybackState } from './audioServiceTypes';

type TrackPlayerModule = {
  setupPlayer?: (options?: any) => Promise<void>;
  updateOptions?: (options: any) => Promise<void>;
  addEventListener?: (event: string, listener: (data: any) => void) => void;
  reset?: () => Promise<void>;
  add?: (track: any) => Promise<void>;
  play?: () => Promise<void>;
  pause?: () => Promise<void>;
  stop?: () => Promise<void>;
  seekTo?: (seconds: number) => Promise<void>;
  setRate?: (speed: number) => Promise<void>;
  getProgress?: () => Promise<{ position: number; duration: number }>;
};

function getTrackPlayerModule(): TrackPlayerModule | null {
  try {
    const module = require('react-native-track-player');
    const TrackPlayer = module?.default ?? module;
    return TrackPlayer && typeof TrackPlayer === 'object' ? (TrackPlayer as TrackPlayerModule) : null;
  } catch (error) {
    console.warn('react-native-track-player is unavailable; audio playback will be disabled.', error);
    return null;
  }
}

function getTrackPlayerConstants() {
  try {
    const module = require('react-native-track-player');
    return {
      AppKilledPlaybackBehavior: module?.AppKilledPlaybackBehavior,
      Capability: module?.Capability,
      Event: module?.Event,
      State: module?.State,
      registerPlaybackService: module?.registerPlaybackService,
    };
  } catch {
    return null;
  }
}

class NativeAudioEngine {
  private listeners: AudioServiceListeners = {};
  private initialized = false;
  private progressInterval: any = null;
  private currentTrackDuration = 0;
  private trackPlayerAvailable = false;

  setListeners(listeners: AudioServiceListeners) {
    this.listeners = listeners;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.initialized = true;

    const TrackPlayer = getTrackPlayerModule();
    const constants = getTrackPlayerConstants();

    if (!TrackPlayer || !constants?.Capability || !constants?.AppKilledPlaybackBehavior) {
      this.trackPlayerAvailable = false;
      console.warn('react-native-track-player is unavailable; audio playback will be disabled.');
      return;
    }

    try {
      this.trackPlayerAvailable = true;
      try {
        await TrackPlayer.setupPlayer?.({});
      } catch (setupError: any) {
        if (!setupError?.message?.includes('already been initialized')) {
          throw setupError;
        }
      }

      await TrackPlayer.updateOptions?.({
        android: {
          appKilledPlaybackBehavior: constants.AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        },
        capabilities: [
          constants.Capability.Play,
          constants.Capability.Pause,
          constants.Capability.SkipToNext,
          constants.Capability.SkipToPrevious,
          constants.Capability.SeekTo,
        ],
        compactCapabilities: [constants.Capability.Play, constants.Capability.Pause],
      });

      this.setupNativeEventListeners();
    } catch (e) {
      this.trackPlayerAvailable = false;
      console.warn('Failed to initialize react-native-track-player, falling back to no-op audio.', e);
    }
  }

  private setupNativeEventListeners() {
    const TrackPlayer = getTrackPlayerModule();
    const constants = getTrackPlayerConstants();

    if (!TrackPlayer || !constants?.Event || !constants?.State) return;

    const { Event, State } = constants;

    TrackPlayer.addEventListener?.(Event.PlaybackState, ({ state }: any) => {
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

    TrackPlayer.addEventListener?.(Event.PlaybackQueueEnded, () => {
      this.listeners.onTrackEnded?.();
    });
  }

  async play(track: TrackData): Promise<void> {
    await this.initialize();

    if (!this.trackPlayerAvailable) {
      this.currentTrackDuration = track.duration;
      this.listeners.onStateChange?.('playing');
      this.listeners.onProgress?.(0, track.duration);
      return;
    }

    const TrackPlayer = getTrackPlayerModule();
    this.currentTrackDuration = track.duration;

    await TrackPlayer?.reset?.();
    await TrackPlayer?.add?.({
      id: track.id,
      url: track.url,
      title: track.title,
      artist: track.artist,
      artwork: track.artwork,
      duration: track.duration,
    });

    await TrackPlayer?.play?.();
  }

  async pause(): Promise<void> {
    if (!this.trackPlayerAvailable) {
      this.listeners.onStateChange?.('paused');
      return;
    }

    await getTrackPlayerModule()?.pause?.();
  }

  async resume(): Promise<void> {
    if (!this.trackPlayerAvailable) {
      this.listeners.onStateChange?.('playing');
      return;
    }

    await getTrackPlayerModule()?.play?.();
  }

  async stop(): Promise<void> {
    if (!this.trackPlayerAvailable) {
      this.listeners.onStateChange?.('idle');
      return;
    }

    await getTrackPlayerModule()?.stop?.();
    this.stopProgressPolling();
  }

  async seek(seconds: number): Promise<void> {
    if (!this.trackPlayerAvailable) return;
    await getTrackPlayerModule()?.seekTo?.(seconds);
  }

  async setSpeed(speed: number): Promise<void> {
    if (!this.trackPlayerAvailable) return;
    await getTrackPlayerModule()?.setRate?.(speed);
  }

  private startProgressPolling() {
    this.stopProgressPolling();
    const TrackPlayer = getTrackPlayerModule();

    if (!TrackPlayer || !TrackPlayer.getProgress) return;
    const getProgress = TrackPlayer.getProgress;

    const poll = async () => {
      try {
        const progress = await getProgress();
        this.listeners.onProgress?.(
          progress.position,
          progress.duration || this.currentTrackDuration
        );
      } catch {}
      if (this.progressInterval) {
        this.progressInterval = setTimeout(poll, 250);
      }
    };

    this.progressInterval = setTimeout(poll, 250);
  }

  private stopProgressPolling() {
    if (this.progressInterval) {
      clearTimeout(this.progressInterval);
      this.progressInterval = null;
    }
  }
}

export const audioService = new NativeAudioEngine();
export * from './audioServiceTypes';
