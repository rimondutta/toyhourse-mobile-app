import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeScreen from '@/components/SafeScreen';
import {
  usePushNotifications,
  type StoredNotification,
} from '@/hooks/usePushNotifications';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDateGroup(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86_400_000);
  const notifDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (notifDay.getTime() === today.getTime()) return 'Today';
  if (notifDay.getTime() === yesterday.getTime()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

/** Returns an icon name and colour based on common notification title keywords */
function getNotificationStyle(title: string): { icon: string; color: string; bg: string } {
  const t = title.toLowerCase();
  if (t.includes('order') || t.includes('shipped') || t.includes('delivered'))
    return { icon: 'cube-outline', color: '#10B981', bg: '#D1FAE5' };
  if (t.includes('promo') || t.includes('offer') || t.includes('sale') || t.includes('discount'))
    return { icon: 'pricetag-outline', color: '#F59E0B', bg: '#FEF3C7' };
  if (t.includes('payment') || t.includes('paid') || t.includes('invoice'))
    return { icon: 'card-outline', color: '#6366F1', bg: '#EEF2FF' };
  if (t.includes('welcome') || t.includes('hello'))
    return { icon: 'hand-left-outline', color: '#EC4899', bg: '#FCE7F3' };
  return { icon: 'notifications-outline', color: '#8B5CF6', bg: '#F3E8FF' };
}

// ─── Notification Row ─────────────────────────────────────────────────────────

function NotificationRow({
  item,
  onRead,
}: {
  item: StoredNotification;
  onRead: (id: string) => void;
}) {
  const style = getNotificationStyle(item.title);

  return (
    <TouchableOpacity
      onPress={() => onRead(item.id)}
      activeOpacity={0.75}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: item.isRead ? 'transparent' : '#F5F3FF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: 46,
          height: 46,
          borderRadius: 23,
          backgroundColor: style.bg,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
          flexShrink: 0,
        }}
      >
        <Ionicons name={style.icon as any} size={22} color={style.color} />
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: item.isRead ? '600' : '700',
              color: '#1E293B',
              flex: 1,
              marginRight: 8,
            }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {!item.isRead && (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#8B5CF6',
                flexShrink: 0,
              }}
            />
          )}
        </View>
        <Text
          style={{ fontSize: 13, color: '#64748B', marginTop: 3, lineHeight: 18 }}
          numberOfLines={2}
        >
          {item.body}
        </Text>
        <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 6, fontWeight: '500' }}>
          {formatRelativeDate(item.receivedAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  const scale = React.useRef(new Animated.Value(0.9)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 10 }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        transform: [{ scale }],
        opacity,
      }}
    >
      <View
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: '#F3E8FF',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        <Ionicons name="notifications-off-outline" size={48} color="#8B5CF6" />
      </View>
      <Text style={{ fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 10, textAlign: 'center' }}>
        No Notifications Yet
      </Text>
      <Text style={{ fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22 }}>
        When you receive order updates, promotions, or alerts, they'll show up here.
      </Text>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const { notifications, unreadCount, markAllRead, markAsRead, clearAllNotifications } =
    usePushNotifications();

  // Group notifications by date label
  const grouped = useMemo(() => {
    const groups: Record<string, StoredNotification[]> = {};
    for (const n of notifications) {
      const label = getDateGroup(n.receivedAt);
      if (!groups[label]) groups[label] = [];
      groups[label].push(n);
    }
    return groups;
  }, [notifications]);

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'This will permanently delete your entire notification history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearAllNotifications,
        },
      ]
    );
  };

  return (
    <SafeScreen>
      {/* ── Header ─────────────────────────────────────────────── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingBottom: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#F1F5F9',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#1E293B" />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#1E293B' }}>
              Notifications
            </Text>
            {unreadCount > 0 && (
              <Text style={{ fontSize: 13, color: '#8B5CF6', fontWeight: '600', marginTop: 1 }}>
                {unreadCount} unread
              </Text>
            )}
          </View>
        </View>

        {/* Action buttons */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllRead}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                backgroundColor: '#F3E8FF',
                borderRadius: 20,
              }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#8B5CF6' }}>
                Mark all read
              </Text>
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity
              onPress={handleClearAll}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#FEE2E2',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Content ────────────────────────────────────────────── */}
      {notifications.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {Object.entries(grouped).map(([label, items]) => (
            <View key={label} style={{ marginBottom: 8 }}>
              {/* Date group header */}
              <View
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  backgroundColor: '#F8FAFC',
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: '#94A3B8',
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                  }}
                >
                  {label}
                </Text>
              </View>

              {/* Notification rows */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  marginHorizontal: 16,
                  borderRadius: 16,
                  overflow: 'hidden',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                {items.map((item, idx) => (
                  <View key={item.id}>
                    <NotificationRow item={item} onRead={markAsRead} />
                    {idx < items.length - 1 && (
                      <View
                        style={{
                          height: 1,
                          backgroundColor: '#F1F5F9',
                          marginLeft: 80,
                        }}
                      />
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}

          <Text
            style={{
              textAlign: 'center',
              color: '#CBD5E1',
              fontSize: 12,
              marginTop: 24,
              fontWeight: '500',
            }}
          >
            Showing last {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </Text>
        </ScrollView>
      )}
    </SafeScreen>
  );
}
