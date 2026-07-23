import { apiRequest } from './apiClient';

export interface UserProfile {
  avatar: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserData {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  profile: UserProfile | null;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: UserData;
}

export interface CategoryData {
  id: string;
  name: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

export interface BookData {
  id: string;
  category: string;
  category_name: string;
  title: string;
  slug: string;
  description: string;
  author: string;
  cover_image: string;
  cover_image_url?: string | null;
  language: string;
  estimated_duration: number;
  display_order: number;
  is_published: boolean;
  is_premium: boolean;
  pdf_file?: string | null;
  pdf_file_url?: string | null;
  chapters_count?: number;
  mantras_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ChapterData {
  id: string;
  book: string;
  title: string;
  chapter_number: number;
  description: string;
  thumbnail: string | null;
  pdf_file?: string | null;
  pdf_file_url?: string | null;
  display_order: number;
  estimated_duration: number;
  is_published: boolean;
  mantras_count?: number;
}

export interface AudioData {
  id: string;
  mantra: string;
  audio_file: string;
  audio_file_url: string | null;
  duration: number;
  start_time: number;
  end_time: number;
}

export interface MantraData {
  id: string;
  chapter: string;
  title: string;
  sanskrit_text: string;
  gujarati_text: string;
  hindi_text: string;
  english_text: string;
  meaning: string;
  notes: string | null;
  display_order: number;
  audio: AudioData | null;
}

export interface SubscriptionPlanData {
  id: string;
  name: string;
  duration_days: number;
  price: string;
  currency: string;
  description: string | null;
  is_active: boolean;
}

export interface SubscriptionData {
  id: string;
  plan: string;
  plan_name: string;
  plan_price: string;
  plan_currency: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'canceled';
  auto_renew: boolean;
}

export interface PaymentData {
  id: string;
  subscription: string;
  amount: string;
  currency: string;
  payment_provider: string;
  transaction_id: string;
  payment_status: 'pending' | 'completed' | 'failed';
  payment_date: string;
}

export const apiService = {
  // -------------------------------------------------------------
  // Accounts & Authentication
  // -------------------------------------------------------------
  accounts: {
    register: async (username: string, email: string, password: string, bio?: string, mobileNumber?: string, fullName?: string): Promise<AuthResponse> => {
      return apiRequest<AuthResponse>('/auth/register/', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, bio, mobile_number: mobileNumber, full_name: fullName }),
      });
    },

    login: async (username: string, password: string): Promise<AuthResponse> => {
      return apiRequest<AuthResponse>('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
    },

    logout: async (): Promise<void> => {
      return apiRequest<void>('/auth/logout/', {
        method: 'POST',
      });
    },

    getProfile: async (): Promise<UserData> => {
      return apiRequest<UserData>('/profile/');
    },

    updateProfile: async (avatarFile?: any, bio?: string, mobileNumber?: string): Promise<UserProfile> => {
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        if (bio) formData.append('bio', bio);
        if (mobileNumber) formData.append('mobile_number', mobileNumber);
        return apiRequest<UserProfile>('/profile/', {
          method: 'PUT',
          body: formData,
        });
      }
      return apiRequest<UserProfile>('/profile/', {
        method: 'PUT',
        body: JSON.stringify({ bio, mobile_number: mobileNumber }),
      });
    },
  },

  // -------------------------------------------------------------
  // Library Catalog
  // -------------------------------------------------------------
  library: {
    getCategories: async (): Promise<CategoryData[]> => {
      return apiRequest<CategoryData[]>('/categories/');
    },

    getBooks: async (params?: { category?: string; search?: string }): Promise<BookData[]> => {
      let query = '';
      if (params) {
        const qParts: string[] = [];
        if (params.category) qParts.push(`category=${params.category}`);
        if (params.search) qParts.push(`search=${encodeURIComponent(params.search)}`);
        if (qParts.length > 0) query = `?${qParts.join('&')}`;
      }
      return apiRequest<BookData[]>(`/books/${query}`);
    },

    getBook: async (id: string): Promise<BookData> => {
      return apiRequest<BookData>(`/books/${id}/`);
    },

    getBookChapters: async (bookId: string): Promise<ChapterData[]> => {
      return apiRequest<ChapterData[]>(`/books/${bookId}/chapters/`);
    },

    getChapter: async (id: string): Promise<ChapterData> => {
      return apiRequest<ChapterData>(`/chapters/${id}/`);
    },

    getChapterMantras: async (chapterId: string, search?: string): Promise<MantraData[]> => {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      return apiRequest<MantraData[]>(`/chapters/${chapterId}/mantras/${query}`);
    },

    getMantra: async (id: string): Promise<MantraData> => {
      return apiRequest<MantraData>(`/mantras/${id}/`);
    },

    getMantraAudio: async (mantraId: string): Promise<AudioData> => {
      return apiRequest<AudioData>(`/mantras/${mantraId}/audio/`);
    },

    searchAllMantras: async (search: string): Promise<MantraData[]> => {
      return apiRequest<MantraData[]>(`/mantras/search/?search=${encodeURIComponent(search)}`);
    },
  },

  // -------------------------------------------------------------
  // Subscriptions & Payments
  // -------------------------------------------------------------
  billing: {
    getPlans: async (): Promise<SubscriptionPlanData[]> => {
      return apiRequest<SubscriptionPlanData[]>('/subscription-plans/');
    },

    getSubscription: async (): Promise<SubscriptionData> => {
      return apiRequest<SubscriptionData>('/subscriptions/');
    },

    subscribe: async (planId: string, autoRenew = true): Promise<SubscriptionData> => {
      return apiRequest<SubscriptionData>('/subscriptions/', {
        method: 'POST',
        body: JSON.stringify({ plan_id: planId, auto_renew: autoRenew }),
      });
    },

    getPaymentHistory: async (): Promise<PaymentData[]> => {
      return apiRequest<PaymentData[]>('/payments/');
    },

    recordPayment: async (paymentPayload: {
      subscription_id: string;
      amount: number;
      currency: string;
      payment_provider: string;
      transaction_id: string;
      payment_status: 'completed' | 'failed' | 'pending';
    }): Promise<PaymentData> => {
      return apiRequest<PaymentData>('/payments/', {
        method: 'POST',
        body: JSON.stringify(paymentPayload),
      });
    },
  },
};
export default apiService;
