import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import useCart from '@/hooks/useCart';
import ToyhourseAIButton from '@/components/ToyhourseAIButton';

interface ToyhourseAIHeaderProps {
  onClose: () => void;
  onNewChat: () => void;
  onToggleSearch?: () => void;
  isSearchActive?: boolean;
  userName?: string;
  hasMessages?: boolean;
}

export default function ToyhourseAIHeader({
  onClose,
  onNewChat,
  onToggleSearch,
  isSearchActive = false,
  hasMessages = false,
}: ToyhourseAIHeaderProps) {
  const { cartItemCount } = useCart();

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleNewChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onNewChat();
  };

  const handleSearchPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleSearch?.();
  };

  const handleCartPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/cart' as any);
  };

  return (
    <View style={styles.container}>
      {/* Left: Back Button & Brand */}
      <View style={styles.leftSection}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleClose}
          style={styles.circleButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </TouchableOpacity>

        <View style={styles.brandContainer}>
          <ToyhourseAIButton
            size="small"
            label="Ai"
            interactive={false}
            showShadow={false}
            borderWidth={2}
          />
          <Text style={styles.brandTitle}>Toyhourse</Text>
        </View>
      </View>

      {/* Right Actions */}
      <View style={styles.rightSection}>
        {/* Search Toys Pill Button */}
        {onToggleSearch && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSearchPress}
            style={[styles.searchPill, isSearchActive && styles.searchPillActive]}
          >
            <Ionicons
              name={isSearchActive ? 'sparkles' : 'search'}
              size={13}
              color={isSearchActive ? '#FFFFFF' : '#000000'}
            />
            <Text style={[styles.searchPillText, isSearchActive && styles.searchPillTextActive]}>
              Search
            </Text>
          </TouchableOpacity>
        )}

        {/* Live Cart Button with badge */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCartPress}
          style={styles.circleButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="cart-outline" size={18} color="#000000" />
          {cartItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemCount > 9 ? '9+' : cartItemCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* New Chat Button */}
        {hasMessages && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleNewChat}
            style={styles.circleButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="create-outline" size={17} color="#000000" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#D1EBD9',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#D1EBD9',
  },
  searchPillActive: {
    backgroundColor: '#2D9E5F',
    borderColor: '#2D9E5F',
  },
  searchPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  searchPillTextActive: {
    color: '#FFFFFF',
  },
  circleButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1EBD9',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#2D9E5F',
    borderRadius: 8,
    paddingHorizontal: 4,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
