import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import LiquidGlassSurface from './LiquidGlassSurface';

interface GlassInputBarProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function GlassInputBar({ onSend, disabled }: GlassInputBarProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSend(text.trim());
    setText('');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        <LiquidGlassSurface intensity={60} tint="light" borderRadius={24} style={styles.glass}>
          <TextInput
            style={styles.input}
            placeholder="Ask anything..."
            placeholderTextColor="#94A3B8"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
            editable={!disabled}
          />
          <TouchableOpacity 
            style={[styles.sendButton, (!text.trim() || disabled) && styles.sendButtonDisabled]}
            activeOpacity={0.7}
            onPress={handleSend}
            disabled={!text.trim() || disabled}
          >
            <Ionicons name="arrow-up" size={20} color="#FFF" />
          </TouchableOpacity>
        </LiquidGlassSurface>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    paddingTop: 8,
  },
  glass: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    color: '#1E293B',
    fontSize: 16,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
});
