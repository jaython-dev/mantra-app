import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Play, Pause, Inbox } from 'lucide-react-native';

// Scale pressable using Reanimated spring for premium haptic-like responsiveness
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ScriptureCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  hasGoldBorder?: boolean;
}

export const ScriptureCard: React.FC<ScriptureCardProps> = ({
  children,
  onPress,
  style,
  hasGoldBorder = false,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPress ? handlePressIn : undefined}
      onPressOut={onPress ? handlePressOut : undefined}
      style={[
        styles.card,
        hasGoldBorder && styles.goldBorder,
        animatedStyle,
        style,
      ]}
      className="bg-white dark:bg-[#1E1917] border border-[#E6DFD3] dark:border-[#3A2A25] shadow-sm shadow-[#3A2E2B]/5 dark:shadow-black/20"
    >
      {children}
    </AnimatedPressable>
  );
};

interface PlayButtonProps {
  isPlaying: boolean;
  onPress: () => void;
  size?: number;
}

export const PlayButton: React.FC<PlayButtonProps> = ({
  isPlaying,
  onPress,
  size = 48,
}) => {
  const scale = useSharedValue(1);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (isPlaying) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 1000 }),
          withTiming(1.0, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      pulse.value = withTiming(1.0);
    }
  }, [isPlaying]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * (isPlaying ? pulse.value : 1) }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 10 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.playBtn,
        { width: size, height: size, borderRadius: size / 2 },
        animatedStyle,
      ]}
      className="bg-[#7A1E1E] dark:bg-[#9B2A2A] border border-[#D4AF37] shadow-md shadow-[#7A1E1E]/20"
    >
      {isPlaying ? (
        <Pause size={size * 0.45} color="#D4AF37" fill="#D4AF37" />
      ) : (
        <Play size={size * 0.45} color="#D4AF37" fill="#D4AF37" style={{ marginLeft: size * 0.05 }} />
      )}
    </AnimatedPressable>
  );
};

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon,
}) => {
  return (
    <View className="flex-1 items-center justify-center p-8 bg-[#FAF7F2] dark:bg-[#120E0D]">
      <View className="mb-6 p-5 rounded-full bg-[#7A1E1E]/5 dark:bg-[#7A1E1E]/10 border border-[#D4AF37]/20">
        {icon || <Inbox size={36} color="#7A1E1E" />}
      </View>
      <Text className="text-lg font-bold text-[#3A2E2B] dark:text-neutral-200 text-center font-inter mb-2">
        {title}
      </Text>
      <Text className="text-sm text-neutral-500 dark:text-neutral-400 text-center font-inter leading-relaxed max-w-[280px]">
        {message}
      </Text>
    </View>
  );
};

export const SkeletonLoader: React.FC<{ variant?: 'grid' | 'list' }> = ({
  variant = 'list',
}) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (variant === 'grid') {
    return (
      <View className="flex-row flex-wrap justify-between p-4">
        {[1, 2, 3, 4].map((i) => (
          <Animated.View
            key={i}
            style={[animatedStyle, { width: '47%', height: 160, borderRadius: 20 }]}
            className="bg-[#E6DFD3] dark:bg-[#2D221F] mb-4"
          />
        ))}
      </View>
    );
  }

  return (
    <View className="p-4 space-y-4">
      {[1, 2, 3].map((i) => (
        <Animated.View
          key={i}
          style={[animatedStyle, { height: 90, borderRadius: 20 }]}
          className="bg-[#E6DFD3] dark:bg-[#2D221F]"
        />
      ))}
    </View>
  );
};

// Traditional scripture border decoration
export const DividerDecoration: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.dividerContainer, style]}>
      <View className="flex-row items-center justify-center space-x-2">
        <View className="h-[1px] w-12 bg-[#D4AF37]/50" />
        <View className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
        <View className="w-2.5 h-2.5 rotate-45 border border-[#D4AF37] bg-[#7A1E1E]" />
        <View className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
        <View className="h-[1px] w-12 bg-[#D4AF37]/50" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  goldBorder: {
    borderColor: '#D4AF37',
  },
  playBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  dividerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
});
