import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  withRepeat 
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height, 
  borderRadius = 8, 
  style 
}) => {
  const { isDark } = useTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 800 }),
        withTiming(0.4, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const backgroundColor = isDark ? '#3A2C27' : '#E6DFD3';

  // If height is not provided, and style does not specify height/aspectRatio, default to 20
  const finalHeight = height !== undefined 
    ? height 
    : (style?.height || style?.aspectRatio ? undefined : 20);

  return (
    <Animated.View
      style={[
        {
          width,
          borderRadius,
          backgroundColor,
        },
        finalHeight !== undefined ? { height: finalHeight } : null,
        style,
        animatedStyle,
      ]}
    />
  );
};

export const BookCardSkeleton: React.FC = () => {
  return (
    <View style={{ width: '47%', marginBottom: 24 }}>
      {/* Book Cover Placeholder */}
      <Skeleton width="100%" height={undefined} style={{ aspectRatio: 0.73, borderRadius: 16 }} />
      {/* Title Placeholder */}
      <Skeleton width="80%" height={16} borderRadius={4} style={{ marginTop: 10 }} />
      {/* Author/Description Placeholder */}
      <Skeleton width="50%" height={12} borderRadius={3} style={{ marginTop: 6 }} />
    </View>
  );
};
