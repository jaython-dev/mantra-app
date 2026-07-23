import React, { useEffect } from 'react';
import { Pressable, View, StatusBar } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming 
} from 'react-native-reanimated';

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const bgScale = useSharedValue(1);

  useEffect(() => {
    // Background slow zoom (Ken Burns effect) over 4.5 seconds
    bgScale.value = withTiming(1.08, { duration: 4500 });
  }, []);

  const bgAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bgScale.value }]
  }));

  return (
    <Pressable 
      onPress={() => onFinish && onFinish()} 
      style={{ flex: 1, backgroundColor: '#120E0D' }}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Animated Background Image */}
      <Animated.Image
        source={require('../assets/images/brahmpath_main.png')}
        style={[{ width: '100%', height: '100%', position: 'absolute' }, bgAnimatedStyle]}
        resizeMode="cover"
      />
    </Pressable>
  );
};

export default SplashScreen;
