import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity } from 'react-native';
import { Search, Heart, Bell } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onFavoritesPress?: () => void;
}

const SPIRITUAL_QUOTES = [
  'तमसो मा ज्योतिर्गमय • Lead us from darkness to light.',
  'योगः कर्मसु कौशलम् • Yoga is excellence in actions.',
  'सत्यमेव जयते • Truth alone triumphs.',
  'वसुधैव कुटुम्बकम् • The world is one family.',
  'Quiet the mind and the soul will speak.',
  'Let noble thoughts come from all directions.'
];

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onFavoritesPress
}) => {
  const { colors } = useTheme();
  const [greeting, setGreeting] = useState('');
  const [quote, setQuote] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Shubh Prabhat • Good Morning');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Shubh Dopahar • Good Afternoon');
    } else if (hour >= 17 && hour < 21) {
      setGreeting('Shubh Sandhya • Good Evening');
    } else {
      setGreeting('Shubh Ratri • Good Night');
    }

    // Select a stable quote for this mount session
    const idx = Math.floor(Math.random() * SPIRITUAL_QUOTES.length);
    setQuote(SPIRITUAL_QUOTES[idx]);
  }, []);

  return (
    <View className="px-5 pt-8 pb-4">
      {/* Top Profile / Greeting Section */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-1 pr-4">
          <Text className="text-xs uppercase tracking-widest font-medium text-spiritual-amber dark:text-spiritual-saffronLight">
            {greeting}
          </Text>
          <Text className="text-2xl font-bold text-spiritual-charcoal dark:text-white mt-1">
            Hari Om 🙏
          </Text>
        </View>
        <View className="flex-row space-x-2">
          {onFavoritesPress && (
            <TouchableOpacity
              onPress={onFavoritesPress}
              className="w-10 h-10 rounded-full bg-white dark:bg-spiritual-surfaceDark items-center justify-center shadow-sm"
            >
              <Heart size={20} color={colors.accent} fill={colors.accent} />
            </TouchableOpacity>
          )}
          <View className="w-10 h-10 rounded-full overflow-hidden border border-spiritual-saffron">
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60' }}
              className="w-full h-full"
            />
          </View>
        </View>
      </View>

      {/* Quote Banner */}
      <View className="bg-spiritual-saffron/10 dark:bg-spiritual-saffron/5 rounded-2xl p-3.5 mb-5 border border-spiritual-saffron/20">
        <Text className="text-xs italic text-center font-medium text-spiritual-amber dark:text-spiritual-saffronLight font-devanagari">
          {quote}
        </Text>
      </View>

      {/* Search Input Box */}
      <View className="flex-row items-center bg-white dark:bg-spiritual-surfaceDark px-4 py-3 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800">
        <Search size={18} color={colors.textMuted} className="mr-2" />
        <TextInput
          placeholder="Search mantras, deities, categories..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 text-sm font-medium text-spiritual-charcoal dark:text-white pb-0 pt-0"
        />
      </View>
    </View>
  );
};
export default Header;
