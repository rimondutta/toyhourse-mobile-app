import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

export interface ToyhourseAIButtonProps {
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  label?: string;
  style?: StyleProp<ViewStyle>;
  showShadow?: boolean;
  interactive?: boolean;
  borderWidth?: number;
}

/**
 * Three 4-point stars cluster matching reference design:
 * - One small star top-left
 * - One main star center-right
 * - One small star bottom-left
 */
function SparkleCluster({
  size = 16,
  color = '#111827',
}: {
  size?: number;
  color?: string;
}) {
  const smallSize = Math.round(size * 0.48);
  const containerWidth = Math.round(size * 1.35);
  const containerHeight = Math.round(size * 1.25);

  return (
    <View
      style={{
        width: containerWidth,
        height: containerHeight,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* Top-left small star */}
      <View style={{ position: 'absolute', top: 0, left: 0 }}>
        <MaterialCommunityIcons name="star-four-points" size={smallSize} color={color} />
      </View>

      {/* Main center-right star */}
      <View style={{ position: 'absolute', right: 0, top: (containerHeight - size) / 2 }}>
        <MaterialCommunityIcons name="star-four-points" size={size} color={color} />
      </View>

      {/* Bottom-left small star */}
      <View style={{ position: 'absolute', bottom: 0, left: 1 }}>
        <MaterialCommunityIcons name="star-four-points" size={smallSize} color={color} />
      </View>
    </View>
  );
}

const SIZE_CONFIG = {
  small: {
    height: 32,
    paddingHorizontal: 12,
    starSize: 13,
    fontSize: 13,
    borderWidth: 2.2,
    gap: 6,
  },
  medium: {
    height: 38,
    paddingHorizontal: 15,
    starSize: 16,
    fontSize: 15,
    borderWidth: 2.8,
    gap: 7,
  },
  large: {
    height: 46,
    paddingHorizontal: 20,
    starSize: 20,
    fontSize: 17,
    borderWidth: 3.2,
    gap: 8,
  },
};

// Vibrant cyan -> neon green -> golden yellow spectrum border
const GRADIENT_COLORS = [
  '#0BC6E2',
  '#10E5C2',
  '#22C55E',
  '#A3E635',
  '#FACC15',
] as const;
const GRADIENT_LOCATIONS: readonly [number, number, ...number[]] = [
  0, 0.22, 0.5, 0.78, 1,
];

export default function ToyhourseAIButton({
  onPress,
  size = 'medium',
  label = 'Ai',
  style,
  showShadow = true,
  interactive = true,
  borderWidth: customBorderWidth,
}: ToyhourseAIButtonProps) {
  const config = SIZE_CONFIG[size] || SIZE_CONFIG.medium;
  const strokeWidth = customBorderWidth ?? config.borderWidth;

  const handlePress = () => {
    if (!interactive) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress();
    } else {
      router.push('/ai-assistant' as any);
    }
  };

  const content = (
    <LinearGradient
      colors={GRADIENT_COLORS}
      locations={GRADIENT_LOCATIONS}
      start={{ x: 0, y: 0.9 }}
      end={{ x: 1, y: 0.1 }}
      style={[
        styles.gradientBorder,
        {
          padding: strokeWidth,
          borderRadius: 9999,
        },
      ]}
    >
      <View
        style={[
          styles.innerPill,
          {
            height: config.height,
            paddingHorizontal: config.paddingHorizontal,
            gap: config.gap,
            borderRadius: 9999,
          },
        ]}
      >
        <SparkleCluster size={config.starSize} color="#111827" />
        <Text style={[styles.label, { fontSize: config.fontSize }]}>{label}</Text>
      </View>
    </LinearGradient>
  );

  if (!interactive) {
    return (
      <View style={[styles.wrapper, showShadow && styles.shadow, style]}>
        {content}
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={[styles.wrapper, showShadow && styles.shadow, style]}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
    borderRadius: 9999,
  },
  shadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  gradientBorder: {
    overflow: 'hidden',
  },
  innerPill: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.2,
    includeFontPadding: false,
  },
});
