import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

interface ToyhourseAIInputBarProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  onToast?: (msg: string) => void;
  onOpenVoice?: () => void;
}

export default function ToyhourseAIInputBar({
  onSend,
  disabled,
  onToast,
  onOpenVoice,
}: ToyhourseAIInputBarProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSend(text.trim());
    setText('');
  };

  const handleAttach = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        onToast?.('Camera roll permission needed to attach photos');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        onToast?.('Photo attached. Describe the toy you are looking for!');
      }
    } catch {
      onToast?.('Could not open gallery');
    }
  };

  const handleMic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onOpenVoice) {
      onOpenVoice();
    } else {
      onToast?.('Listening... Speak your prompt');
    }
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      {/* Floating Input Dock */}
      <View style={styles.inputCapsule}>
        {/* Plus / Attach Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleAttach}
          style={styles.attachBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="add" size={20} color="#2D9E5F" />
        </TouchableOpacity>

        {/* Text Input */}
        <TextInput
          style={styles.input}
          placeholder="Ask me anything..."
          placeholderTextColor="#9CA3AF"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
          editable={!disabled}
        />

        {/* Right Action: Mic or Send Button */}
        {canSend ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSend}
            style={styles.sendButton}
          >
            <Ionicons name="arrow-up" size={17} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleMic}
            style={styles.micButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="mic-outline" size={20} color="#2D9E5F" />
          </TouchableOpacity>
        )}
      </View>

      {/* Subtle Disclaimer */}
      <Text style={styles.disclaimerText}>
        Toyhourse AI can make mistakes. Verify important info.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#D1EBD9',
  },
  inputCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#D1EBD9',
    shadowColor: '#2D9E5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  attachBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    color: '#111827',
    fontSize: 15,
    paddingHorizontal: 8,
    paddingVertical: 8,
    maxHeight: 110,
    minHeight: 38,
  },
  micButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#2D9E5F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimerText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
    marginBottom: 4,
  },
});
