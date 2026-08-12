import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { getLastUpdated } from '@/lib/api';

const POLL_INTERVAL_MS = 5 * 60_000; // 5 minutes — safe for Vercel Hobby plan

/**
 * useLastUpdated
 *
 * Polls GET /api/products/last-updated every 30 seconds while the app is
 * in the foreground. If the timestamp returned by the server differs from
 * the last known value, it invalidates the React Query 'products' cache
 * so all product lists refetch fresh data automatically.
 *
 * This is the Part 3 "polling sync" mechanism — it means:
 * - Admin adds/edits a product on the website
 * - Within 30 seconds, mobile users see the updated product list
 * - No app rebuild or reinstall required
 *
 * Mount this hook once at the root level (e.g. in _layout.tsx).
 */
export function useLastUpdated() {
  const queryClient = useQueryClient();
  const lastTimestampRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const checkForUpdates = async () => {
    try {
      const res = await getLastUpdated();
      if (!res.success) return;

      const serverTimestamp = res.data.timestamp;

      if (
        lastTimestampRef.current !== 0 &&
        serverTimestamp > lastTimestampRef.current
      ) {
        // Products changed on the server — invalidate all product queries
        await queryClient.invalidateQueries({ queryKey: ['products'] });
        await queryClient.invalidateQueries({ queryKey: ['product'] });
      }

      lastTimestampRef.current = serverTimestamp;
    } catch {
      // Polling failures are silent — don't crash the app
    }
  };

  const startPolling = () => {
    if (intervalRef.current) return; // already running
    // Fire once immediately on resume, then every POLL_INTERVAL_MS
    checkForUpdates();
    intervalRef.current = setInterval(checkForUpdates, POLL_INTERVAL_MS);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    // Start polling when the hook mounts (app is in foreground)
    startPolling();

    // Pause polling when app goes to background, resume when it returns
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextState === 'active'
        ) {
          // App came back to foreground — resume polling + immediate check
          startPolling();
        } else if (nextState.match(/inactive|background/)) {
          stopPolling();
        }
        appStateRef.current = nextState;
      }
    );

    return () => {
      stopPolling();
      subscription.remove();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
