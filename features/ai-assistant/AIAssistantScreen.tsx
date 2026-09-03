import React, { useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import LiquidOrb from './components/LiquidOrb';
import LiquidGlassSurface from './components/LiquidGlassSurface';
import GlassInputBar from './components/GlassInputBar';
import QuickReplyChips from './components/QuickReplyChips';
import ChatBubble from './components/ChatBubble';
import ProductRecommendationCard from './components/ProductRecommendationCard';
import useChatbot from './hooks/useChatbot';
import type { ChatMessage } from './types';

export default function AIAssistantScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { messages, status, errorMessage, sendMessage, retryLastMessage } = useChatbot();
  const flatListRef = useRef<FlatList>(null);

  const isGreeting = messages.length === 0;
  const firstName = user?.name?.split(' ')[0] || 'there';

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    return (
      <View style={{ marginBottom: item.products?.length ? 24 : 0 }}>
        <ChatBubble role={item.role} content={item.content} isStreaming={item.isStreaming} />
        {item.products && item.products.length > 0 && (
          <View style={styles.productsContainer}>
            <FlatList
              horizontal
              data={item.products}
              keyExtractor={(p) => p.slug}
              renderItem={({ item: product }) => <ProductRecommendationCard product={product} />}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsScrollContent}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient Simulator */}
      <View style={[StyleSheet.absoluteFillObject, styles.bgBase]} />
      <View style={[styles.bgGlow, styles.bgGlow1]} />
      <View style={[styles.bgGlow, styles.bgGlow2]} />

      {/* Header Close Button */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        {!isGreeting && (
          <Animated.View entering={FadeIn} style={styles.headerOrbContainer}>
             {/* Small orb in header during conversation */}
             <LiquidOrb size="avatar" active={status === 'loading' || status === 'streaming'} />
          </Animated.View>
        )}
        <View style={{ flex: 1 }} />
        <TouchableOpacity activeOpacity={0.7} onPress={handleClose}>
          <LiquidGlassSurface intensity={40} tint="light" borderRadius={20} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FFF" />
          </LiquidGlassSurface>
        </TouchableOpacity>
      </View>

      {isGreeting ? (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.greetingContainer}>
          <View style={styles.heroOrbContainer}>
            <LiquidOrb size="hero" active={status === 'loading' || status === 'streaming'} />
          </View>
          <Text style={styles.greetingTitle}>Hey {firstName},</Text>
          <Text style={styles.greetingSubtitle}>What can I help with?</Text>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn} layout={Layout.duration(300)} style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.chatScrollContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }}
          />
        </Animated.View>
      )}

      {/* Footer Area */}
      <Animated.View layout={Layout.duration(300)} style={[styles.footer, { paddingBottom: insets.bottom || 16 }]}>
        {isGreeting && (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <QuickReplyChips onSelect={sendMessage} />
          </Animated.View>
        )}
        {errorMessage && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <TouchableOpacity onPress={retryLastMessage}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        <GlassInputBar 
          onSend={sendMessage} 
          disabled={status === 'loading' || status === 'streaming'} 
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0A1E',
  },
  bgBase: {
    backgroundColor: '#0F0A1E',
  },
  bgGlow: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
    opacity: 0.15,
  },
  bgGlow1: {
    top: -200,
    left: -200,
    backgroundColor: '#7C3AED',
  },
  bgGlow2: {
    bottom: -100,
    right: -200,
    backgroundColor: '#3B82F6',
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  headerOrbContainer: {
    marginLeft: 4,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  greetingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: -80, // visual offset
  },
  heroOrbContainer: {
    marginBottom: 40,
  },
  greetingTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 32,
    fontStyle: 'italic',
    fontWeight: '300',
    color: '#E0E7FF',
    marginBottom: 8,
  },
  greetingSubtitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  chatContainer: {
    flex: 1,
  },
  chatScrollContent: {
    paddingTop: 24,
    paddingBottom: 24,
  },
  productsContainer: {
    marginLeft: 60, // Align with assistant text (44 avatar + 16 gap)
    marginTop: -8,
  },
  productsScrollContent: {
    paddingRight: 24,
  },
  footer: {
    zIndex: 10,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  errorText: {
    color: '#FECACA',
    fontSize: 14,
  },
  retryText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
