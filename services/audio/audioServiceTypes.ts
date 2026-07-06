export interface TrackData {
  id: string;
  url: any; // Asset require or URL
  title: string;
  artist: string;
  artwork: any;
  duration: number;
}

export type PlaybackState = 'idle' | 'playing' | 'paused' | 'buffering' | 'ended';

export interface AudioServiceListeners {
  onProgress?: (position: number, duration: number) => void;
  onStateChange?: (state: PlaybackState) => void;
  onTrackEnded?: () => void;
}
