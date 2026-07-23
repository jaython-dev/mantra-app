import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useAuthStore } from '../../store/authStore';

/**
 * Dynamically resolves the Django REST API base url.
 * - Web: http://127.0.0.1:8000/api/v1
 * - iOS Simulator: http://127.0.0.1:8000/api/v1
 * - Android Emulator: http://10.0.2.2:8000/api/v1
 * - Physical LAN devices: extracts host IP from Expo bundler
 */
export const getBaseUrl = (): string => {
  if (Platform.OS === 'web' || Platform.OS === 'ios') {
    return 'http://127.0.0.1:8000/api/v1';
  }
  
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    // Connect to Django running on host port 8000
    return `http://${ip}:8000/api/v1`;
  }
  
  return Platform.OS === 'android' 
    ? 'http://10.0.2.2:8000/api/v1' 
    : 'http://127.0.0.1:8000/api/v1';
};

export interface APIError {
  status: number;
  message: string;
  errors: Record<string, string[] | string>;
}

/**
 * Unified request wrapper handling Token authentication headers
 * and parsing the custom API Response wrappers.
 */
export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Token ${token}`);
  }
  
  // Set JSON content-type if body is not a FormData
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  const config: RequestInit = {
    ...options,
    headers,
  };
  
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${getBaseUrl()}${formattedEndpoint}`;
  
  try {
    const response = await fetch(url, config);
    const responseData = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      if (response.status === 401) {
        // Automatically clear invalid token/session
        useAuthStore.getState().logout();
      }
      const errorMsg = responseData.message || 'API request failed';
      const errors = responseData.errors || {};
      const errorPayload: APIError = {
        status: response.status,
        message: errorMsg,
        errors: typeof errors === 'object' ? errors : { detail: String(errors) }
      };
      throw errorPayload;
    }
    
    // Unwrap standard DRF wrappers { success, message, data }
    if (responseData && typeof responseData === 'object' && 'success' in responseData) {
      if (responseData.success === false) {
        throw {
          status: response.status,
          message: responseData.message || 'Request failed',
          errors: responseData.errors || {}
        } as APIError;
      }
      return responseData.data as T;
    }
    
    return responseData as T;
  } catch (error) {
    // If it's already an APIError, propagate it
    if (error && typeof error === 'object' && 'status' in error) {
      throw error;
    }
    
    // Otherwise fallback to network error
    throw {
      status: 0,
      message: error instanceof Error ? error.message : 'Network request failed',
      errors: { non_field_errors: ['Could not connect to the sacred sanctuary server. Please check your connection.'] }
    } as APIError;
  }
}
