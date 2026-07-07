import { Platform } from 'react-native';

class MMKVMock {
  private store: Record<string, string> = {};

  constructor() {
    // Seed from localStorage if on Web
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key) {
            this.store[key] = window.localStorage.getItem(key) || '';
          }
        }
      } catch (e) {
        console.warn('Failed to read from localStorage', e);
      }
    }
  }

  set(key: string, value: string | number | boolean) {
    this.store[key] = String(value);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(key, String(value));
      } catch (e) {}
    }
  }

  getString(key: string): string | undefined {
    return this.store[key] || undefined;
  }

  getBoolean(key: string): boolean | undefined {
    const val = this.getString(key);
    return val === undefined ? undefined : val === 'true';
  }

  getNumber(key: string): number | undefined {
    const val = this.getString(key);
    return val === undefined ? undefined : Number(val);
  }

  delete(key: string) {
    delete this.store[key];
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {}
    }
  }
}

let storage: {
  set: (key: string, value: string | number | boolean) => void;
  getString: (key: string) => string | undefined;
  getBoolean: (key: string) => boolean | undefined;
  getNumber: (key: string) => number | undefined;
  delete: (key: string) => void;
};

if (Platform.OS !== 'web') {
  try {
    const { createMMKV } = require('react-native-mmkv');
    const mmkvInstance = createMMKV();
    storage = {
      set: (key, value) => mmkvInstance.set(key, value),
      getString: (key) => mmkvInstance.getString(key),
      getBoolean: (key) => mmkvInstance.getBoolean(key),
      getNumber: (key) => mmkvInstance.getNumber(key),
      delete: (key) => mmkvInstance.remove(key),
    };
  } catch (e) {
    console.warn('MMKV failed to initialize, falling back to mock storage', e);
    storage = new MMKVMock();
  }
} else {
  storage = new MMKVMock();
}

export { storage };
