import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LiquidGlassSurface from './LiquidGlassSurface';
import LiquidOrb from './LiquidOrb';
import Animated, { FadeIn } from 'react-native-reanimated';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

const ChatBubble = React.memo(({ role, content, isStreaming }: ChatBubbleProps) => {
  const isUser = role === 'user';

  if (isUser) {
    return (
      <Animated.View entering={FadeIn} style={styles.userContainer}>
        <LiquidGlassSurface tint="light" intensity={60} borderRadius={20} style={styles.userBubble}>
          <Text style={styles.userText}>{content}</Text>
        </LiquidGlassSurface>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn} style={styles.assistantContainer}>
      <View style={styles.orbContainer}>
        <LiquidOrb size="avatar" active={isStreaming} />
      </View>
      <View style={styles.assistantContent}>
        <Text style={styles.assistantText}>
          {content}
          {isStreaming && <Text style={styles.cursor}> ⬤</Text>}
        </Text>
      </View>
    </Animated.View>
  );
});

export default ChatBubble;

const styles = StyleSheet.create({
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  userBubble: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(124, 58, 237, 0.1)', // subtle purple
  },
  userText: {
    color: '#1E1B4B',
    fontSize: 16,
    lineHeight: 22,
  },
  assistantContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  orbContainer: {
    marginRight: 12,
    marginTop: 4,
  },
  assistantContent: {
    flex: 1,
    paddingTop: 8,
  },
  assistantText: {
    color: '#334155',
    fontSize: 16,
    lineHeight: 24,
  },
  cursor: {
    color: '#8B5CF6',
    fontSize: 12,
  },
});
