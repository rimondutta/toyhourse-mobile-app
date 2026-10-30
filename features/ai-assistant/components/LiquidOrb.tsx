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
  size?: 'hero' | 'avatar' | number;
  active?: boolean;
  colorScheme?: 'green' | 'blue' | 'monochrome';
}

export default function LiquidOrb({
  size = 'hero',
  active = false,
  colorScheme = 'green',
}: LiquidOrbProps) {
  const orbSize = typeof size === 'number' ? size : size === 'hero' ? 160 : 44;

  const rotation1 = useSharedValue(0);
  const rotation2 = useSharedValue(0);
  const rotation3 = useSharedValue(0);
  const scale = useSharedValue(1);

  const shimmer1 = useSharedValue(0.7);
  const shimmer2 = useSharedValue(0.7);
  const shimmer3 = useSharedValue(0.7);

  useEffect(() => {
    rotation1.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );
    rotation2.value = withRepeat(
      withTiming(-360, { duration: 25000, easing: Easing.linear }),
      -1,
      false
    );
    rotation3.value = withRepeat(
      withTiming(360, { duration: 30000, easing: Easing.linear }),
      -1,
      false
    );
  }, [rotation1, rotation2, rotation3]);

  useEffect(() => {
    shimmer1.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.85, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    shimmer2.value = withRepeat(
      withSequence(
        withTiming(0.55, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.9, { duration: 3500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    shimmer3.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [shimmer1, shimmer2, shimmer3]);

  useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.12, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.95, { duration: 900, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.97, { duration: 2500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [active, scale]);

  const containerSize = useSharedValue(orbSize);
  useEffect(() => {
    containerSize.value = withSpring(orbSize, {
      damping: 15,
      stiffness: 100,
    });
  }, [containerSize, orbSize]);

  const containerStyle = useAnimatedStyle(() => ({
    width: containerSize.value,
    height: containerSize.value,
    transform: [{ scale: scale.value }],
  }));

  const layer1Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation1.value}deg` }, { translateX: containerSize.value * 0.1 }],
    opacity: shimmer1.value,
  }));

  const layer2Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation2.value}deg` }, { translateY: containerSize.value * -0.15 }],
    opacity: shimmer2.value,
  }));

  const layer3Style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation3.value}deg` }, { translateX: containerSize.value * -0.05 }],
    opacity: shimmer3.value,
  }));

  const isGreen = colorScheme === 'green';
  const isMono = colorScheme === 'monochrome';

  return (
    <Animated.View
      style={[
        styles.container,
        containerStyle,
        isGreen && { shadowColor: '#22C55E' },
        isMono && { shadowColor: '#000000', shadowOpacity: 0.15 },
      ]}
    >
      {/* Base Background */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          styles.base,
          isGreen && { backgroundColor: '#DCFCE7' },
          isMono && { backgroundColor: '#F3F4F6' },
        ]}
      />

      {/* Layer 1 */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          styles.layer,
          styles.layer1,
          isGreen && { backgroundColor: '#22C55E' },
          isMono && { backgroundColor: '#111827' },
          layer1Style,
        ]}
      />

      {/* Layer 2 */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          styles.layer,
          styles.layer2,
          isGreen && { backgroundColor: '#86EFAC' },
          isMono && { backgroundColor: '#4B5563' },
          layer2Style,
        ]}
      />

      {/* Layer 3 */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          styles.layer,
          styles.layer3,
          isGreen && { backgroundColor: '#15803D' },
          isMono && { backgroundColor: '#9CA3AF' },
          layer3Style,
        ]}
      />

      {/* Frosted Glass Refraction Overlay */}
      <View style={[StyleSheet.absoluteFillObject, styles.glassOverlay]} />

      {/* Specular Highlight */}
      <View style={[StyleSheet.absoluteFillObject, styles.specularHighlight]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 9999,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 32,
    elevation: 14,
  },
  base: {
    backgroundColor: '#DCFCE7',
  },
  layer: {
    borderRadius: 9999,
  },
  layer1: {
    backgroundColor: '#22C55E',
    width: '120%',
    height: '120%',
    top: '-10%',
    left: '-10%',
  },
  layer2: {
    backgroundColor: '#86EFAC',
    width: '100%',
    height: '100%',
    top: '10%',
    left: '20%',
  },
  layer3: {
    backgroundColor: '#15803D',
    width: '130%',
    height: '130%',
    top: '-15%',
    left: '-15%',
  },
  glassOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 9999,
  },
  specularHighlight: {
    borderRadius: 9999,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    borderBottomWidth: 0.5,
    borderRightWidth: 0.5,
  },
});
