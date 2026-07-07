import React, { useEffect, useRef } from 'react';
import { Text, Pressable, Animated } from 'react-native';

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
  const scaleAnim = useRef(new Animated.Value(isActive ? 1.05 : 1.0)).current;
  const opacityAnim = useRef(new Animated.Value(isActive ? 1.0 : 0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isActive ? 1.05 : 1.0,
        damping: 15,
        stiffness: 150,
        useNativeDriver: true,
      }),
      Animated.spring(opacityAnim, {
        toValue: isActive ? 1.0 : 0.5,
        damping: 15,
        stiffness: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive]);

  return (
    <Pressable
      onPress={onPress}
      className={`py-5 px-4 items-center rounded-2xl transition-all duration-200 ${
        isActive ? 'bg-spiritual-saffron/5 dark:bg-spiritual-saffron/10 border border-spiritual-saffron/10' : ''
      }`}
    >
      <Animated.Text
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}
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
