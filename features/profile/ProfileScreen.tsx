import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Image, Alert, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { User, Award, Flame, BookOpen, Clock, Download, ChevronRight, Settings, Moon, Globe, LogOut, ShieldCheck, CreditCard } from 'lucide-react-native';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { usePlayerStore } from '../../store/playerStore';
import { apiService, SubscriptionPlanData, SubscriptionData } from '../../services/api/apiService';
import { ScriptureCard, DividerDecoration } from '../../components/ui/DesignSystem';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { isDark, setTheme } = useTheme();
  const { 
    downloadedChapters,
    streakDays,
    readHours,
    completedBooks,
    mantrasChanted,
    streakMap,
    fetchDashboardStats
  } = useFavoritesStore();
  const { token, user, hasActiveSubscription, login, logout, setHasActiveSubscription } = useAuthStore();
  const { currentMantra } = usePlayerStore();

  // Billing State
  const [plans, setPlans] = useState<SubscriptionPlanData[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [activeSub, setActiveSub] = useState<SubscriptionData | null>(null);

  const downloadedSize = downloadedChapters.length * 12.4; // MB

  const getDaysOfWeek = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date();
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      result.push({
        label: days[d.getDay()],
        idx: i
      });
    }
    return result;
  };

  // Fetch billing details and dashboard stats if user is logged in
  useEffect(() => {
    if (token) {
      fetchBillingInfo();
      fetchDashboardStats();
    }
  }, [token]);

  const fetchBillingInfo = async () => {
    setPlansLoading(true);
    try {
      // 1. Fetch user's subscription
      const sub = await apiService.billing.getSubscription().catch(() => null);
      if (sub) {
        setActiveSub(sub);
        setHasActiveSubscription(sub.status === 'active');
      } else {
        setActiveSub(null);
        setHasActiveSubscription(false);
      }
      
      // 2. Fetch available subscription plans
      const plansList = await apiService.billing.getPlans();
      setPlans(plansList);
    } catch (e) {
      console.warn('Failed to load billing info from backend API', e);
    } finally {
      setPlansLoading(false);
    }
  };



  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to exit your sanctuary?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiService.accounts.logout().catch(() => null);
          } finally {
            logout();
            setActiveSub(null);
          }
        }
      }
    ]);
  };

  const handlePurchaseSubscription = async (plan: SubscriptionPlanData) => {
    Alert.alert(
      'Activate Subscription',
      `Subscribe to the ${plan.name} for ${plan.price} ${plan.currency}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: async () => {
            try {
              // 1. Create a subscription record in backend
              const sub = await apiService.billing.subscribe(plan.id);
              
              // 2. Process and record mock payment checkout (Razorpay simulated)
              await apiService.billing.recordPayment({
                subscription_id: sub.id,
                amount: parseFloat(plan.price),
                currency: plan.currency,
                payment_provider: 'Razorpay',
                transaction_id: `pay_mock_${Date.now()}`,
                payment_status: 'completed'
              });

              Alert.alert('Access Unlocked', `Successfully active subscription! All scriptures, premium mantras and audios are now unlocked.`);
              fetchBillingInfo();
            } catch (e: any) {
              Alert.alert('Subscription Failed', e.message || 'Payment processing failed.');
            }
          }
        }
      ]
    );
  };

  const isTrial = () => {
    if (!activeSub) return false;
    const start = new Date(activeSub.start_date).getTime();
    const end = new Date(activeSub.end_date).getTime();
    const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return diffDays === 4;
  };

  // -------------------------------------------------------------
  // Render State: AUTHENTICATED
  // -------------------------------------------------------------
  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2] dark:bg-[#120E0D]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: currentMantra ? 180 : 100 }}
      >
        {/* Profile Header Block */}
        <View className="items-center mt-6 mb-8">
          <View className="w-24 h-24 rounded-full bg-[#7A1E1E] border-2 border-[#D4AF37] items-center justify-center shadow-lg shadow-black/10">
            <User size={48} color="#FAF7F2" />
          </View>
          <Text className="text-xl font-bold text-[#7A1E1E] dark:text-[#E6DFD3] mt-4 font-inter">
            {user?.full_name || user?.username || 'Seeker'}
          </Text>
          <Text className="text-xs text-neutral-400 font-inter mt-1">
            {user?.profile?.bio || 'Spiritual Seeker'}
          </Text>

          {/* Premium Badge */}
          {hasActiveSubscription ? (
            <View className="flex-row items-center bg-[#D4AF37]/15 border border-[#D4AF37]/40 rounded-full px-4 py-1.5 mt-3">
              <ShieldCheck size={14} color="#D4AF37" />
              <Text className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider ml-1.5 font-inter">
                {isTrial() ? '4-Day Trial Active' : 'Premium Active'} (Expiry: {activeSub?.end_date ? new Date(activeSub.end_date).toLocaleDateString() : 'N/A'})
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-full px-4 py-1.5 mt-3">
              <User size={12} color="#8C7A6B" />
              <Text className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1.5 font-inter">
                Free Sanctuary Pass
              </Text>
            </View>
          )}
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap justify-between mb-8">
          <View className="bg-white dark:bg-[#1C1513] border border-[#E6DFD3] dark:border-[#3A2A25] rounded-[20px] p-4 w-[47%] mb-4 items-center">
            <Flame size={20} color="#E2C785" fill="#E2C785" />
            <Text className="text-lg font-bold text-[#7A1E1E] dark:text-white font-inter mt-2">
              {streakDays} Days
            </Text>
            <Text className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider font-inter">
              Dhyana Streak
            </Text>
          </View>

          <View className="bg-white dark:bg-[#1C1513] border border-[#E6DFD3] dark:border-[#3A2A25] rounded-[20px] p-4 w-[47%] mb-4 items-center">
            <Clock size={20} color="#7A1E1E" />
            <Text className="text-lg font-bold text-[#7A1E1E] dark:text-white font-inter mt-2">
              {readHours} hrs
            </Text>
            <Text className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider font-inter">
              Total Reading
            </Text>
          </View>

          <View className="bg-white dark:bg-[#1C1513] border border-[#E6DFD3] dark:border-[#3A2A25] rounded-[20px] p-4 w-[47%] items-center">
            <BookOpen size={20} color="#7A1E1E" />
            <Text className="text-lg font-bold text-[#7A1E1E] dark:text-white font-inter mt-2">
              {completedBooks} Books
            </Text>
            <Text className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider font-inter">
              Books Completed
            </Text>
          </View>

          <View className="bg-white dark:bg-[#1C1513] border border-[#E6DFD3] dark:border-[#3A2A25] rounded-[20px] p-4 w-[47%] items-center">
            <Award size={20} color="#D4AF37" />
            <Text className="text-lg font-bold text-[#7A1E1E] dark:text-white font-inter mt-2">
              {mantrasChanted} Verses
            </Text>
            <Text className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider font-inter">
              Verses Chanted
            </Text>
          </View>
        </View>

        {/* Subscription Plan Purchases (if not subscribed) */}
        {!hasActiveSubscription && plans.length > 0 && (
          <View className="bg-white dark:bg-[#1C1513] border border-[#D4AF37]/50 rounded-[20px] p-5 mb-8">
            <View className="flex-row items-center mb-3">
              <CreditCard size={18} color="#D4AF37" />
              <Text className="text-sm font-bold text-[#7A1E1E] dark:text-[#E6DFD3] ml-2 font-inter uppercase tracking-wide">
                Unlock Premium Audiobooks
              </Text>
            </View>
            <Text className="text-xs text-neutral-500 mb-4 font-inter leading-relaxed">
              Gain unlimited access to all premium commentaries, chanting tracks, and offline downloads.
            </Text>

            {plansLoading ? (
              <ActivityIndicator color="#7A1E1E" />
            ) : (
              <View className="space-y-3">
                {plans.map((plan) => (
                  <Pressable
                    key={plan.id}
                    onPress={() => handlePurchaseSubscription(plan)}
                    className="flex-row items-center justify-between p-4 bg-[#FAF7F2] dark:bg-[#120E0D] border border-[#E6DFD3] dark:border-[#3A2A25] rounded-xl active:bg-[#7A1E1E]/5"
                  >
                    <View className="flex-1 pr-2">
                      <Text className="text-sm font-bold text-[#3A2E2B] dark:text-[#E6DFD3] font-inter">
                        {plan.name}
                      </Text>
                      {plan.description && (
                        <Text className="text-[10px] text-neutral-400 font-inter mt-0.5" numberOfLines={1}>
                          {plan.description}
                        </Text>
                      )}
                    </View>
                    <View className="bg-[#7A1E1E]/10 border border-[#7A1E1E]/20 px-3 py-1.5 rounded-lg">
                      <Text className="text-xs font-bold text-[#7A1E1E] dark:text-[#D4AF37] font-inter">
                        {plan.price} {plan.currency}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Streaks & Consistency Map */}
        <View className="bg-white dark:bg-[#1C1513] border border-[#E6DFD3] dark:border-[#3A2A25] rounded-[20px] p-5 mb-8">
          <Text className="text-xs font-bold text-neutral-400 uppercase tracking-widest font-inter mb-4">
            Consistency Calendar
          </Text>
          
          <View className="flex-row justify-between mb-4">
            {getDaysOfWeek().map((dayObj, index) => (
              <View key={index} className="items-center flex-1">
                <Text className="text-[10px] text-neutral-400 mb-2 font-inter">{dayObj.label}</Text>
                <View
                  className={`w-6 h-6 rounded-full items-center justify-center border ${
                    streakMap[dayObj.idx]
                      ? 'bg-[#7A1E1E] border-[#7A1E1E]'
                      : 'bg-transparent border-neutral-300 dark:border-neutral-800'
                  }`}
                >
                  <Text className={`text-[9px] font-bold ${streakMap[dayObj.idx] ? 'text-white' : 'text-neutral-400'}`}>
                    ✓
                  </Text>
                </View>
              </View>
            ))}
          </View>
          <Text className="text-[10px] text-center text-neutral-400 font-inter">
            Completing 10 mins of reading or chanting preserves your daily streak.
          </Text>
        </View>

        {/* Divider */}
        <DividerDecoration />

        {/* Settings Shortcuts Accordions */}
        <View className="space-y-3.5 mb-8">
          <Text className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1 font-inter">
            Sanctuary Actions
          </Text>

          {/* Download sizes summary */}
          <ScriptureCard style={{ padding: 14 }}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Download size={18} color="#7A1E1E" />
                <Text className="text-sm font-bold text-[#3A2E2B] dark:text-[#E6DFD3] ml-3 font-inter">
                  Offline Storage Space
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-xs text-neutral-500 font-inter mr-2">
                  {downloadedSize.toFixed(1)} MB
                </Text>
                <Pressable onPress={() => navigation.navigate('Downloads')}>
                  <ChevronRight size={16} color="#8C7A6B" />
                </Pressable>
              </View>
            </View>
          </ScriptureCard>

          {/* Theme Settings toggle */}
          <ScriptureCard style={{ padding: 14 }}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Moon size={18} color="#7A1E1E" />
                <Text className="text-sm font-bold text-[#3A2E2B] dark:text-[#E6DFD3] ml-3 font-inter">
                  Toggle Dark Theme
                </Text>
              </View>
              <Pressable
                onPress={() => setTheme(isDark ? 'light' : 'dark')}
                className={`w-11 h-6 rounded-full px-1 justify-center ${isDark ? 'bg-[#7A1E1E]' : 'bg-[#E6DFD3]'}`}
              >
                <View className={`w-4 h-4 rounded-full bg-white ${isDark ? 'self-end' : 'self-start'}`} />
              </Pressable>
            </View>
          </ScriptureCard>

          {/* Language shortcuts */}
          <ScriptureCard style={{ padding: 14 }}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Globe size={18} color="#7A1E1E" />
                <Text className="text-sm font-bold text-[#3A2E2B] dark:text-[#E6DFD3] ml-3 font-inter">
                  Change App Language
                </Text>
              </View>
              <Text className="text-xs text-neutral-400 font-inter mr-1">English (EN)</Text>
            </View>
          </ScriptureCard>

          {/* General app settings shortcut */}
          <ScriptureCard style={{ padding: 14 }}>
            <Pressable
              onPress={() => navigation.navigate('Settings')}
              className="flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <Settings size={18} color="#7A1E1E" />
                <Text className="text-sm font-bold text-[#3A2E2B] dark:text-[#E6DFD3] ml-3 font-inter">
                  Detailed App Configurations
                </Text>
              </View>
              <ChevronRight size={16} color="#8C7A6B" />
            </Pressable>
          </ScriptureCard>

          {/* Logout Actions */}
          <ScriptureCard style={{ padding: 14 }} onPress={handleLogout}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <LogOut size={18} color="#EF4444" />
                <Text className="text-sm font-bold text-[#EF4444] ml-3 font-inter">
                  Log Out Sanctuary
                </Text>
              </View>
              <ChevronRight size={16} color="#EF4444" />
            </View>
          </ScriptureCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
