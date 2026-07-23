import { create } from 'zustand';
import { storage } from '../services/storage/storageService';

export interface AuthState {
  token: string | null;
  user: any | null;
  hasActiveSubscription: boolean;
  isLoading: boolean;
  
  setToken: (token: string | null) => void;
  setUser: (user: any | null) => void;
  setHasActiveSubscription: (active: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  login: (token: string, user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: storage.getString('auth_token') || null,
  user: storage.getString('auth_user') ? JSON.parse(storage.getString('auth_user')!) : null,
  hasActiveSubscription: storage.getBoolean('has_active_subscription') || false,
  isLoading: false,

  setToken: (token) => {
    if (token) {
      storage.set('auth_token', token);
    } else {
      storage.delete('auth_token');
    }
    set({ token });
  },

  setUser: (user) => {
    if (user) {
      storage.set('auth_user', JSON.stringify(user));
    } else {
      storage.delete('auth_user');
    }
    set({ user });
  },

  setHasActiveSubscription: (active) => {
    storage.set('has_active_subscription', active);
    set({ hasActiveSubscription: active });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  login: (token, user) => {
    storage.set('auth_token', token);
    storage.set('auth_user', JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    storage.delete('auth_token');
    storage.delete('auth_user');
    storage.delete('has_active_subscription');
    set({ token: null, user: null, hasActiveSubscription: false });
  }
}));
export default useAuthStore;
