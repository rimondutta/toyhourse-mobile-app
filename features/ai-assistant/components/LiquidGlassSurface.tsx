import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';

interface LiquidGlassSurfaceProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  borderRadius?: number;
}

export default function LiquidGlassSurface({
  children,
  style,
  intensity = 50,
  tint = 'light',
  borderRadius = 24,
}: LiquidGlassSurfaceProps) {
  return (
    <View style={[styles.container, { borderRadius }, style]}>
      <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFillObject} />
      
      {/* Light inner border for glass refraction edge */}
      <View style={[styles.innerHighlight, { borderRadius }]} pointerEvents="none" />
      
      {/* Semi-transparent overlay for depth */}
      <View style={[styles.overlay, { borderRadius }]} pointerEvents="none" />

      {/* Content */}
      <View style={[styles.content, { borderRadius }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    // Subtle drop shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 5,
  },
  innerHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },
});
