import { useState, useEffect, useRef } from 'react';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export interface PushNotificationState {
  expoPushToken?: string;
}

// expo-notifications remote push support was removed from Expo Go in SDK 53.
// Checking appOwnership prevents us from even loading the module in Expo Go.
const IS_EXPO_GO = Constants.appOwnership === 'expo';

export const usePushNotifications = (): PushNotificationState => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const listenerRefs = useRef<{ remove: () => void }[]>([]);

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

      // (Optional) We could add listeners here if we wanted to trigger an immediate
      // refresh of the useNotifications React Query hook when a push arrives.
    })();

    return () => {
      cancelled = true;
      listenerRefs.current.forEach((sub) => sub.remove());
      listenerRefs.current = [];
    };
  }, []);

  return {
    expoPushToken,
  };
};
