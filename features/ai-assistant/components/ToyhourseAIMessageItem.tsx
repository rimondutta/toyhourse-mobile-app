import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import Animated, { FadeIn } from 'react-native-reanimated';
import ToyhourseAIMarkdownText from './ToyhourseAIMarkdownText';
import ToyhourseAIProductCard from './ToyhourseAIProductCard';
import ToyhourseAIButton from '@/components/ToyhourseAIButton';
import type { ChatMessage } from '../types';

interface ToyhourseAIMessageItemProps {
  message: ChatMessage;
  isLastAssistant?: boolean;
  onRetry?: () => void;
  onToast?: (msg: string) => void;
  onAskAI?: (prompt: string) => void;
}

export default function ToyhourseAIMessageItem({
  message,
  isLastAssistant = false,
  onRetry,
  onToast,
  onAskAI,
}: ToyhourseAIMessageItemProps) {
  const [feedback, setFeedback] = useState<'liked' | 'disliked' | null>(null);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Clipboard.setStringAsync(message.content);
    onToast?.('Response copied to clipboard');
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: message.content,
        title: 'Toyhourse AI Response',
      });
    } catch {
      // Ignore share cancellation
    }
  };

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFeedback(prev => (prev === 'liked' ? null : 'liked'));
    if (feedback !== 'liked') {
      onToast?.('Thanks for your feedback');
    }
  };

  const handleDislike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFeedback(prev => (prev === 'disliked' ? null : 'disliked'));
    if (feedback !== 'disliked') {
      onToast?.('Thanks for your feedback');
    }
  };

  if (isUser) {
    return (
      <Animated.View entering={FadeIn.duration(200)} style={styles.userRow}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{message.content}</Text>
        </View>
        <View style={styles.userAvatarCircle}>
          <Ionicons name="person" size={13} color="#000000" />
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(250)} style={styles.assistantRow}>
        <View style={{ marginTop: 2 }}>
        <ToyhourseAIButton
          size="small"
          label="Ai"
          interactive={false}
          showShadow={false}
          borderWidth={2}
        />
      </View>

      <View style={styles.assistantContent}>
        <ToyhourseAIMarkdownText
          content={message.content}
          isStreaming={message.isStreaming}
        />

        {message.products && message.products.length > 0 && (
          <View style={styles.productsContainer}>
            <Text style={styles.productsHeader}>Recommended Toys</Text>
            <FlatList
              horizontal
              data={message.products}
              keyExtractor={p => p.slug || p.id || Math.random().toString()}
              renderItem={({ item }) => (
                <ToyhourseAIProductCard
                  product={item}
                  onToast={onToast}
                  onAskAI={onAskAI}
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsScroll}
            />
          </View>
        )}

        {/* Minimalist Micro-actions Row */}
        {!message.isStreaming && message.content.length > 0 && (
          <View style={styles.actionsBar}>
            <TouchableOpacity
              onPress={handleCopy}
              style={styles.actionIconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="copy-outline" size={16} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLike}
              style={styles.actionIconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={feedback === 'liked' ? 'thumbs-up' : 'thumbs-up-outline'}
                size={16}
                color={feedback === 'liked' ? '#000000' : '#6B7280'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDislike}
              style={styles.actionIconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={feedback === 'disliked' ? 'thumbs-down' : 'thumbs-down-outline'}
                size={16}
                color={feedback === 'disliked' ? '#DC2626' : '#6B7280'}
              />
            </TouchableOpacity>

            {isLastAssistant && onRetry && (
              <TouchableOpacity
                onPress={onRetry}
                style={styles.actionIconBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="refresh-outline" size={16} color="#6B7280" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleShare}
              style={styles.actionIconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="share-social-outline" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  userRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginBottom: 20,
    paddingHorizontal: 16,
    gap: 8,
  },
  userBubble: {
    maxWidth: '78%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#D1EBD9',
  },
  userText: {
    color: '#111827',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  userAvatarCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#DCF2E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  assistantRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 16,
    gap: 10,
  },
  aiBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2D9E5F',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  assistantContent: {
    flex: 1,
  },
  productsContainer: {
    marginTop: 14,
    marginBottom: 8,
  },
  productsHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  productsScroll: {
    paddingRight: 16,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
    paddingTop: 4,
  },
  actionIconBtn: {
    padding: 4,
  },
});
