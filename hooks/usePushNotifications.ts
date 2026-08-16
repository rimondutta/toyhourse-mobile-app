import { useState, useEffect, useRef, useCallback } from 'react';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StoredNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  receivedAt: string; // ISO string
  isRead: boolean;
}

export interface PushNotificationState {
  expoPushToken?: string;
  notifications: StoredNotification[];
  unreadCount: number;
  markAllRead: () => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

const NOTIFICATIONS_STORAGE_KEY = 'push_notifications_history';
const MAX_STORED_NOTIFICATIONS = 50;

// expo-notifications remote push support was removed from Expo Go in SDK 53.
// Checking appOwnership prevents us from even loading the module in Expo Go.
const IS_EXPO_GO = Constants.appOwnership === 'expo';

/** Load persisted notifications from AsyncStorage */
async function loadNotifications(): Promise<StoredNotification[]> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Persist notifications array to AsyncStorage */
async function saveNotifications(items: StoredNotification[]): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Fail silently — notification history is non-critical
  }
}

export const usePushNotifications = (): PushNotificationState => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const listenerRefs = useRef<{ remove: () => void }[]>([]);

  // Load persisted notifications on mount
  useEffect(() => {
    loadNotifications().then(setNotifications);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const clearAllNotifications = useCallback(async () => {
    setNotifications([]);
    await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
  }, []);

  useEffect(() => {
    // Don't load expo-notifications at all in Expo Go — the module has
    // side effects that fire on import and throw errors in SDK 53+.
    if (IS_EXPO_GO) return;

    let cancelled = false;

    (async () => {
      // Dynamic import: expo-notifications is only loaded NOW, after IS_EXPO_GO check
      const Device = (await import('expo-device')).default;
      const Notifications = await import('expo-notifications');

      if (cancelled) return;

      // Configure how notifications appear when app is in the foreground
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // Set up Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      // Request permissions
      if (!Device.isDevice) {
        console.warn('Must use physical device for Push Notifications');
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;

      // Get token
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      if (!projectId) {
        console.warn('No EAS Project ID. Run `eas init` to enable push notifications.');
        return;
      }

      try {
        const token = await Notifications.getExpoPushTokenAsync({ projectId });
        if (!cancelled) setExpoPushToken(token.data);
      } catch (error) {
        console.warn('Error getting push token:', error);
      }

      // Persist incoming notifications to local history
      const receivedSub = Notifications.addNotificationReceivedListener(async (notification) => {
        if (cancelled) return;
        const newEntry: StoredNotification = {
          id: notification.request.identifier,
          title: notification.request.content.title ?? 'Notification',
          body: notification.request.content.body ?? '',
          data: (notification.request.content.data ?? {}) as Record<string, unknown>,
          receivedAt: new Date().toISOString(),
          isRead: false,
        };

        setNotifications((prev) => {
          // Avoid duplicates
          if (prev.some((n) => n.id === newEntry.id)) return prev;
          const updated = [newEntry, ...prev].slice(0, MAX_STORED_NOTIFICATIONS);
          saveNotifications(updated);
          return updated;
        });
      });

      // Mark notification as read when user taps it
      const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
        const id = response.notification.request.identifier;
        setNotifications((prev) => {
          const updated = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
          saveNotifications(updated);
          return updated;
        });
      });

      listenerRefs.current = [receivedSub, responseSub];
    })();

    return () => {
      cancelled = true;
      listenerRefs.current.forEach((sub) => sub.remove());
      listenerRefs.current = [];
    };
  }, []);

  return {
    expoPushToken,
    notifications,
    unreadCount,
    markAllRead,
    markAsRead,
    clearAllNotifications,
  };
};
