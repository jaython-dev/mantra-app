import { Platform } from 'react-native';
import { TrackData, AudioServiceListeners, PlaybackState } from './audioServiceTypes';

class WebAudioEngine {
  private audio: HTMLAudioElement | null = null;
  private listeners: AudioServiceListeners = {};
  private progressInterval: any = null;
  private currentTrack: TrackData | null = null;
  private playbackSpeed = 1.0;

  setListeners(listeners: AudioServiceListeners) {
    this.listeners = listeners;
  }

  async initialize(): Promise<void> {
    // HTML5 Audio loads lazily on play
  }

  async play(track: TrackData): Promise<void> {
    this.stopProgressPolling();
    
    if (this.audio) {
      this.audio.pause();
    }

    this.currentTrack = track;
    
    let audioUrl = '';
    if (typeof track.url === 'string') {
      audioUrl = track.url;
    } else if (typeof track.url === 'number') {
      try {
        const { Image } = require('react-native');
        const resolved = Image.resolveAssetSource(track.url);
        audioUrl = resolved ? resolved.uri : '';
      } catch {
        audioUrl = '';
      }
    }

    if (!audioUrl) {
      console.warn('Unable to resolve audio asset for track:', track.title);
      return;
    }

    this.audio = new Audio(audioUrl);
    this.audio.playbackRate = this.playbackSpeed;

    this.audio.addEventListener('play', () => {
      this.listeners.onStateChange?.('playing');
      this.startProgressPolling();
    });

    this.audio.addEventListener('pause', () => {
      this.listeners.onStateChange?.('paused');
      this.stopProgressPolling();
    });

    this.audio.addEventListener('ended', () => {
      this.listeners.onStateChange?.('ended');
      this.stopProgressPolling();
      this.listeners.onTrackEnded?.();
    });

    this.audio.addEventListener('error', (e) => {
      console.error('HTMLAudio error:', e);
      this.listeners.onStateChange?.('idle');
    });

    try {
      await this.audio.play();
    } catch (e) {
      console.warn('Web Audio autoplay block triggered (requires user gesture):', e);
    }
  }

  async pause(): Promise<void> {
    if (this.audio) {
      this.audio.pause();
    }
  }

  async resume(): Promise<void> {
    if (this.audio) {
      await this.audio.play();
    }
  }

  async stop(): Promise<void> {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.listeners.onStateChange?.('idle');
    }
    this.stopProgressPolling();
  }

  async seek(seconds: number): Promise<void> {
    if (this.audio) {
      this.audio.currentTime = seconds;
      this.listeners.onProgress?.(
        seconds,
        this.audio.duration || this.currentTrack?.duration || 0
      );
    }
  }

  async setSpeed(speed: number): Promise<void> {
    this.playbackSpeed = speed;
    if (this.audio) {
      this.audio.playbackRate = speed;
    }
  }

  private startProgressPolling() {
    this.stopProgressPolling();
    this.progressInterval = setInterval(() => {
      if (this.audio) {
        this.listeners.onProgress?.(
          this.audio.currentTime,
          this.audio.duration || this.currentTrack?.duration || 0
        );
      }
    }, 250);
  }

  private stopProgressPolling() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }
}

export const audioService = new WebAudioEngine();

// No-op on web — only needed natively for Android background audio.
// Must be exported here so index.ts can import it without crashing on web.
export function registerBackgroundService() {}
