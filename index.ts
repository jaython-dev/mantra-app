import { registerRootComponent } from 'expo';

// Register TrackPlayer playback service immediately at the top of entry point
// to prevent "No task registered for key TrackPlayer" warnings on startup.
try {
  const module = require('react-native-track-player');
  const registerPlaybackService = module?.registerPlaybackService || module?.default?.registerPlaybackService;
  if (typeof registerPlaybackService === 'function') {
    registerPlaybackService(() => async () => {
      const TrackPlayer = module?.default ?? module;
      const { Event } = require('react-native-track-player');

      TrackPlayer.addEventListener(Event.RemotePlay, () => {
        try {
          require('./store/playerStore').usePlayerStore.getState().resume();
        } catch (e) {
          console.warn('Failed to handle remote-play event:', e);
        }
      });

      TrackPlayer.addEventListener(Event.RemotePause, () => {
        try {
          require('./store/playerStore').usePlayerStore.getState().pause();
        } catch (e) {
          console.warn('Failed to handle remote-pause event:', e);
        }
      });

      TrackPlayer.addEventListener(Event.RemoteNext, () => {
        try {
          require('./store/playerStore').usePlayerStore.getState().next();
        } catch (e) {
          console.warn('Failed to handle remote-next event:', e);
        }
      });

      TrackPlayer.addEventListener(Event.RemotePrevious, () => {
        try {
          require('./store/playerStore').usePlayerStore.getState().previous();
        } catch (e) {
          console.warn('Failed to handle remote-previous event:', e);
        }
      });

      TrackPlayer.addEventListener(Event.RemoteStop, () => {
        try {
          require('./store/playerStore').usePlayerStore.getState().stop();
        } catch (e) {
          console.warn('Failed to handle remote-stop event:', e);
        }
      });
    });
  }
} catch (e) {
  console.warn('TrackPlayer is not available, skipping background service registration. Error: ' + (e instanceof Error ? e.message + '\n' + e.stack : String(e)));
}

import App from './App';

registerRootComponent(App);
