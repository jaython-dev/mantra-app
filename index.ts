import { registerRootComponent } from 'expo';
import { registerBackgroundService } from './services/audio/audioService';

import App from './App';

// Register RNTP headless playback service BEFORE registerRootComponent.
// This is required on Android for background audio to keep working when
// the user switches apps or locks the screen.
registerBackgroundService();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
