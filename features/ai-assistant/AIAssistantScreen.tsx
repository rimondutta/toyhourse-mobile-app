import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import ToyhourseAIHeader from './components/ToyhourseAIHeader';
import ToyhourseAIGreeting from './components/ToyhourseAIGreeting';
import ToyhourseAIMessageItem from './components/ToyhourseAIMessageItem';
import ToyhourseAIInputBar from './components/ToyhourseAIInputBar';
import ToyhourseAIProductSearch from './components/ToyhourseAIProductSearch';
import ToyhourseAIVoiceChat from './components/ToyhourseAIVoiceChat';
import useChatbot from './hooks/useChatbot';
import type { ChatMessage } from './types';

export default function AIAssistantScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const {
    messages,
    status,
    errorMessage,
    sendMessage,
    retryLastMessage,
    clearChat,
  } = useChatbot();
  const flatListRef = useRef<FlatList>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasMessages = messages.length > 0;

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleNewChat = () => {
    clearChat();
    showToast('Started a new conversation');
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isLastAssistant =
      item.role === 'assistant' && index === messages.length - 1;

    return (
      <ToyhourseAIMessageItem
        message={item}
        isLastAssistant={isLastAssistant}
        onRetry={retryLastMessage}
        onToast={showToast}
        onAskAI={sendMessage}
      />
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Dark status bar for clean light theme */}
      <StatusBar style="dark" />

      {/* Clean Light Header */}
      <ToyhourseAIHeader
        onClose={handleClose}
        onNewChat={handleNewChat}
        onToggleSearch={() => setIsSearchOpen(prev => !prev)}
        isSearchActive={isSearchOpen}
        userName={user?.name || 'User'}
        hasMessages={hasMessages}
      />

      {/* Temporary Toast Banner */}
      {toastMessage && (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.toastContainer}>
          <View style={styles.toastPill}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </Animated.View>
      )}

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 56 : 0}
      >
        {/* Main Content: Greeting or Message List */}
        <View style={styles.content}>
          {!hasMessages ? (
            <ToyhourseAIGreeting
              onSelectPrompt={sendMessage}
              onOpenSearch={() => setIsSearchOpen(true)}
            />
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={item => item.id}
              renderItem={renderMessage}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }}
            />
          )}
        </View>

        {/* Error state if request failed */}
        {errorMessage && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.errorContainer}>
            <View style={styles.errorInner}>
              <Text style={styles.errorText}>{errorMessage}</Text>
              <TouchableOpacity onPress={retryLastMessage} style={styles.retryBtn}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Bottom Floating Input Dock matching reference image */}
        <View style={{ paddingBottom: isKeyboardVisible ? 6 : Math.max(insets.bottom, 12) }}>
          <ToyhourseAIInputBar
            onSend={sendMessage}
            disabled={status === 'loading' || status === 'streaming'}
            onToast={showToast}
            onOpenVoice={() => setIsVoiceOpen(true)}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Interactive AI Product Search Modal/Drawer */}
      {isSearchOpen && (
        <ToyhourseAIProductSearch
          onClose={() => setIsSearchOpen(false)}
          onAskAI={(prompt) => {
            setIsSearchOpen(false);
            sendMessage(prompt);
          }}
          onToast={showToast}
        />
      )}

      {/* Voice Chat Mode Modal matching Reference Screen 3 */}
      {isVoiceOpen && (
        <ToyhourseAIVoiceChat
          onClose={() => setIsVoiceOpen(false)}
          onSendVoicePrompt={(prompt) => {
            setIsVoiceOpen(false);
            sendMessage(prompt);
          }}
          onToast={showToast}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  toastContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99,
  },
  toastPill: {
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  errorContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  errorInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    color: '#991B1B',
    fontSize: 13,
    flex: 1,
  },
  retryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    marginLeft: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});
