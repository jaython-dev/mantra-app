import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, ShieldAlert } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../services/api/apiService';

export const AuthScreen: React.FC = () => {
  const loginStore = useAuthStore((state) => state.login);
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Email ID or Mobile Number
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const generateUsername = (name: string) => {
    const cleanName = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return `${cleanName || 'seeker'}_${randomSuffix}`;
  };

  const validateEmail = (val: string) => {
    return val.includes('@') && val.includes('.');
  };

  const validateMobile = (val: string) => {
    // Basic digits & optional '+' sign validation
    const digits = val.replace(/\D/g, '');
    return digits.length >= 8;
  };

  const handleAuthSubmit = async () => {
    setFormError(null);

    if (isRegistering) {
      if (!fullName || !email || !mobileNumber || !password) {
        setFormError('Please fill in all required fields (Full Name, Email, Mobile, and Password).');
        return;
      }
      if (!validateEmail(email)) {
        setFormError('Please enter a valid email address.');
        return;
      }
      if (!validateMobile(mobileNumber)) {
        setFormError('Please enter a valid mobile number (at least 8 digits).');
        return;
      }
      if (password.length < 8) {
        setFormError('Password must be at least 8 characters long.');
        return;
      }
    } else {
      if (!loginIdentifier || !password) {
        setFormError('Please fill in both fields.');
        return;
      }
    }

    setFormLoading(true);
    try {
      if (isRegistering) {
        // Register view
        const generatedUsername = generateUsername(fullName);
        const res = await apiService.accounts.register(generatedUsername, email, password, bio, mobileNumber, fullName);
        loginStore(res.token, res.user);
        Alert.alert('Sanctuary Created', 'Welcome to your sacred spiritual retreat!');
      } else {
        // Login view (Identifier can be email or mobile number)
        const res = await apiService.accounts.login(loginIdentifier, password);
        loginStore(res.token, res.user);
        Alert.alert('Welcome Back', 'Successfully returned to your sanctuary.');
      }
    } catch (e: any) {
      setFormError(e.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2] dark:bg-[#120E0D] justify-center px-6">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 40 }}>
        <View className="items-center mb-8">
          <View className="w-16 h-16 rounded-full bg-[#7A1E1E] border-2 border-[#D4AF37] items-center justify-center shadow-lg">
            <User size={32} color="#FAF7F2" />
          </View>
          <Text className="text-2xl font-bold text-[#7A1E1E] dark:text-[#E6DFD3] mt-4 font-inter text-center">
            {isRegistering ? 'Spiritual Registration' : 'Sanctuary Login'}
          </Text>
          <Text className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 font-inter text-center leading-relaxed max-w-[280px]">
            {isRegistering 
              ? 'Create a sanctuary account to track chanting streaks and bookmark scriptures' 
              : 'Sign in to access your sacred scriptures, chanting progress, and bookmarks'}
          </Text>
        </View>

        {formError && (
          <View className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-4 mb-5 flex-row items-start space-x-2">
            <ShieldAlert size={16} color="#EF4444" className="mt-0.5" />
            <Text className="flex-1 text-xs text-red-600 dark:text-red-400 font-inter leading-relaxed">
              {formError}
            </Text>
          </View>
        )}

        <View className="space-y-4 mb-6">
          {!isRegistering ? (
            // Login View
            <View>
              <Text className="text-xs font-semibold text-neutral-500 mb-1.5 ml-1 uppercase tracking-wide">
                Email ID or Mobile Number
              </Text>
              <TextInput
                className="bg-[#E6DFD3]/30 dark:bg-[#2D221F]/60 border border-[#E6DFD3] dark:border-[#3A2A25] rounded-2xl px-4 py-3.5 text-sm text-[#3A2E2B] dark:text-neutral-200 font-inter"
                placeholder="e.g. seeker@example.com or +919876543210"
                placeholderTextColor="#8C7A6B"
                value={loginIdentifier}
                onChangeText={setLoginIdentifier}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          ) : (
            // Register View
            <>
              <View>
                <Text className="text-xs font-semibold text-neutral-500 mb-1.5 ml-1 uppercase tracking-wide">
                  Full Name *
                </Text>
                <TextInput
                  className="bg-[#E6DFD3]/30 dark:bg-[#2D221F]/60 border border-[#E6DFD3] dark:border-[#3A2A25] rounded-2xl px-4 py-3.5 text-sm text-[#3A2E2B] dark:text-neutral-200 font-inter"
                  placeholder="e.g. John Doe"
                  placeholderTextColor="#8C7A6B"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>

              <View className="mt-4">
                <Text className="text-xs font-semibold text-neutral-500 mb-1.5 ml-1 uppercase tracking-wide">
                  Email Address *
                </Text>
                <TextInput
                  className="bg-[#E6DFD3]/30 dark:bg-[#2D221F]/60 border border-[#E6DFD3] dark:border-[#3A2A25] rounded-2xl px-4 py-3.5 text-sm text-[#3A2E2B] dark:text-neutral-200 font-inter"
                  placeholder="seeker@example.com"
                  placeholderTextColor="#8C7A6B"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View className="mt-4">
                <Text className="text-xs font-semibold text-neutral-500 mb-1.5 ml-1 uppercase tracking-wide">
                  Mobile Number *
                </Text>
                <TextInput
                  className="bg-[#E6DFD3]/30 dark:bg-[#2D221F]/60 border border-[#E6DFD3] dark:border-[#3A2A25] rounded-2xl px-4 py-3.5 text-sm text-[#3A2E2B] dark:text-neutral-200 font-inter"
                  placeholder="e.g. +919876543210"
                  placeholderTextColor="#8C7A6B"
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
              </View>
            </>
          )}

          <View className="mt-4">
            <Text className="text-xs font-semibold text-neutral-500 mb-1.5 ml-1 uppercase tracking-wide">
              Password
            </Text>
            <TextInput
              className="bg-[#E6DFD3]/30 dark:bg-[#2D221F]/60 border border-[#E6DFD3] dark:border-[#3A2A25] rounded-2xl px-4 py-3.5 text-sm text-[#3A2E2B] dark:text-neutral-200 font-inter"
              placeholder="Minimum 8 characters"
              placeholderTextColor="#8C7A6B"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {isRegistering && (
            <View className="mt-4">
              <Text className="text-xs font-semibold text-neutral-500 mb-1.5 ml-1 uppercase tracking-wide">
                Spiritual Bio (Optional)
              </Text>
              <TextInput
                className="bg-[#E6DFD3]/30 dark:bg-[#2D221F]/60 border border-[#E6DFD3] dark:border-[#3A2A25] rounded-2xl px-4 py-3.5 text-sm text-[#3A2E2B] dark:text-neutral-200 font-inter"
                placeholder="I chant for peace and spiritual focus..."
                placeholderTextColor="#8C7A6B"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={2}
              />
            </View>
          )}
        </View>

        <Pressable
          onPress={handleAuthSubmit}
          disabled={formLoading}
          className="bg-[#7A1E1E] py-4 rounded-2xl items-center justify-center shadow-md active:scale-[0.99] mt-2"
        >
          {formLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-sm font-inter">
              {isRegistering ? 'Register Sanctuary Account' : 'Sign In'}
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => {
            setIsRegistering(!isRegistering);
            setFormError(null);
          }}
          className="mt-6 align-center active:opacity-75"
        >
          <Text className="text-xs text-[#7A1E1E] dark:text-[#D4AF37] text-center font-semibold font-inter">
            {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AuthScreen;
