import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  withSpring,
} from 'react-native-reanimated';

interface LiquidOrbProps {
  size?: 'hero' | 'avatar';
  active?: boolean;
}

export default function LiquidOrb({ size = 'hero', active = false }: LiquidOrbProps) {
  const orbSize = size === 'hero' ? 160 : 44; // hero slightly smaller so it doesn't clip
  
  // Rotations for the colored blobs
  const rotation1 = useSharedValue(0);
  const rotation2 = useSharedValue(0);
  const rotation3 = useSharedValue(0);

  // Scale for breathing effect
  const scale = useSharedValue(1);

  useEffect(() => {
    // Continuous rotation
    rotation1.value = withRepeat(
      withTiming(360, { duration: 12000, easing: Easing.linear }),
      -1,
      false
    );
    rotation2.value = withRepeat(
      withTiming(-360, { duration: 15000, easing: Easing.linear }),
      -1,
      false
    );
    rotation3.value = withRepeat(
      withTiming(360, { duration: 18000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    if (active) {
      // Faster, deeper breathing when thinking
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.95, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      // Slow, subtle breathing when idle
      scale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.98, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [active]);

  // Spring to the correct size
  const containerSize = useSharedValue(orbSize);
  useEffect(() => {
    containerSize.value = withSpring(orbSize, {
      damping: 15,
      stiffness: 100,
    });
  }, [orbSize]);

  const containerStyle = useAnimatedStyle(() => ({
    width: containerSize.value,
    height: containerSize.value,
    transform: [{ scale: scale.value }],
  }));

  const layer1Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation1.value}deg` }, { translateX: containerSize.value * 0.1 }],
  }));

  const layer2Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation2.value}deg` }, { translateY: containerSize.value * -0.15 }],
  }));

  const layer3Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation3.value}deg` }, { translateX: containerSize.value * -0.05 }],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Base Background */}
      <View style={[StyleSheet.absoluteFillObject, styles.base]} />
      
      {/* Layer 1: Deep Blue */}
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.layer, styles.layer1, layer1Style]} />
      
      {/* Layer 2: Amber / Orange */}
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.layer, styles.layer2, layer2Style]} />
      
      {/* Layer 3: Lavender */}
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.layer, styles.layer3, layer3Style]} />
      
      {/* Glass Overlay for refraction/blending */}
      <View style={[StyleSheet.absoluteFillObject, styles.glassOverlay]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 9999,
    overflow: 'hidden',
    backgroundColor: '#fff',
    // Shadow for depth
    shadowColor: '#7C3AED', // Purple glow
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  base: {
    backgroundColor: '#E0E7FF', // Indigo 100
  },
  layer: {
    borderRadius: 9999,
    opacity: 0.7,
  },
  layer1: {
    backgroundColor: '#3B82F6', // Blue 500
    width: '120%',
    height: '120%',
    top: '-10%',
    left: '-10%',
  },
  layer2: {
    backgroundColor: '#F59E0B', // Amber 500
    width: '100%',
    height: '100%',
    top: '10%',
    left: '20%',
  },
  layer3: {
    backgroundColor: '#A855F7', // Purple 500
    width: '130%',
    height: '130%',
    top: '-15%',
    left: '-15%',
  },
  glassOverlay: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 9999,
  },
});
