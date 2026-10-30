import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import LiquidOrb from './LiquidOrb';

interface ToyhourseAIVoiceChatProps {
  onClose: () => void;
  onSendVoicePrompt: (prompt: string) => void;
  onToast?: (msg: string) => void;
}

const VOICE_DEMO_PROMPTS = [
  'Help me find the best educational toy for a 6 year old child.',
  'Show me top rated toys under ৳1,500 in stock right now.',
  'What are your newest best-selling toys this week?',
];

export default function ToyhourseAIVoiceChat({
  onClose,
  onSendVoicePrompt,
  onToast,
}: ToyhourseAIVoiceChatProps) {
  const [isListening, setIsListening] = useState(true);

  const handleToggleMic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isListening) {
      setIsListening(true);
      onToast?.('Listening... Speak your prompt');
    } else {
      setIsListening(false);
      // Simulate voice captured prompt
      const randomPrompt =
        VOICE_DEMO_PROMPTS[Math.floor(Math.random() * VOICE_DEMO_PROMPTS.length)];
      onToast?.('Voice captured! Sending to AI...');
      setTimeout(() => {
        onClose();
        onSendVoicePrompt(randomPrompt);
      }, 700);
    }
  };

  const handleTextMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.container}>
      {/* Top Header matching reference image Screen 3 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color="#111827" />
          <Text style={styles.headerTitle}>Voice chat</Text>
        </TouchableOpacity>

        <View style={styles.proPill}>
          <Text style={styles.proPillText}>AI Pro</Text>
        </View>
      </View>

      {/* Center: Glowing Liquid Orb & Status Text */}
      <View style={styles.centerSection}>
        <View style={styles.orbWrapper}>
          <LiquidOrb size={170} active={isListening} colorScheme="green" />
        </View>

        <Text style={styles.statusTitle}>
          {isListening ? "I'm listening, go ahead." : 'Processing audio...'}
        </Text>
        <Text style={styles.statusSubtitle}>
          Tap the microphone button when finished speaking
        </Text>
      </View>

      {/* Bottom Floating Control Bar matching reference image */}
      <View style={styles.bottomBar}>
        {/* Switch to text chat */}
        <TouchableOpacity
          onPress={handleTextMode}
          style={styles.sideControlBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#2D9E5F" />
        </TouchableOpacity>

        {/* Center Microphone Pill */}
        <TouchableOpacity
          onPress={handleToggleMic}
          style={[styles.mainMicBtn, !isListening && styles.mainMicBtnPaused]}
          activeOpacity={0.85}
        >
          <Ionicons
            name={isListening ? 'mic' : 'mic-off'}
            size={28}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* Close voice mode */}
        <TouchableOpacity
          onPress={onClose}
          style={styles.sideControlBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={20} color="#2D9E5F" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: 100,
    justifyContent: 'space-between',
    paddingBottom: 40,
    paddingTop: 54,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  proPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1EBD9',
  },
  proPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D9E5F',
  },
  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  orbWrapper: {
    marginBottom: 44,
  },
  statusTitle: {
    fontSize: 27,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.6,
    textAlign: 'center',
    marginBottom: 10,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
    paddingHorizontal: 24,
  },
  sideControlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1EBD9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainMicBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2D9E5F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2D9E5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  mainMicBtnPaused: {
    backgroundColor: '#9CA3AF',
    shadowColor: '#9CA3AF',
  },
});

