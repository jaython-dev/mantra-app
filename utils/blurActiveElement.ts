import { Platform } from 'react-native';

/**
 * Clears the active browser element focus on Web.
 * This prevents focused elements from retaining focus when screens are hidden or transitioned,
 * resolving accessibility (ARIA) warnings in the browser.
 */
export function blurActiveElement() {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    try {
      (document.activeElement as HTMLElement)?.blur();
    } catch (e) {
      // Ignore errors silently
    }
  }
}
