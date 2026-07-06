import React, { useEffect } from 'react';
import { Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface LyricItemProps {
  text: string;
  translation: string;
  isActive: boolean;
  onPress: () => void;
}

export const LyricItem: React.FC<LyricItemProps> = ({
  text,
  translation,
  isActive,
  onPress,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withSpring(isActive ? 1.05 : 1.0, { damping: 15 });
    opacity.value = withSpring(isActive ? 1.0 : 0.5, { damping: 15 });
  }, [isActive]);

  const animatedTextClass = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Pressable
      onPress={onPress}
      className={`py-5 px-4 items-center rounded-2xl transition-all duration-200 ${
        isActive ? 'bg-spiritual-saffron/5 dark:bg-spiritual-saffron/10 border border-spiritual-saffron/10' : ''
      }`}
    >
      <Animated.Text
        style={animatedTextClass}
        className={`text-xl font-bold font-devanagari text-center tracking-wide leading-relaxed ${
          isActive
            ? 'text-spiritual-saffron dark:text-spiritual-saffronLight font-black'
            : 'text-neutral-500 dark:text-neutral-500'
        }`}
      >
        {text}
      </Animated.Text>
      {isActive && (
        <Text className="text-xs text-neutral-500 dark:text-neutral-300 text-center mt-2 px-6 leading-relaxed font-medium">
          {translation}
        </Text>
      )}
    </Pressable>
  );
};
export default LyricItem;
