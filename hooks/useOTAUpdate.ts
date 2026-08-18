import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Updates from 'expo-updates';

// ── Types ─────────────────────────────────────────────────────

export type OTAStatus =
  | 'idle'           // Haven't checked yet
  | 'checking'       // Checking for update
  | 'up-to-date'     // No update available
  | 'available'      // Update found, not yet downloaded
  | 'downloading'    // Downloading update
  | 'ready'          // Downloaded, ready to restart
  | 'error';         // Something went wrong

export interface OTAUpdateState {
  status: OTAStatus;
  updateMessage: string;
  error: string | null;
  /** True once the first check has completed (success or fail) */
  isChecked: boolean;
  /** Trigger manual re-check */
  checkForUpdate: () => Promise<void>;
  /** Download the available update */
  downloadUpdate: () => Promise<void>;
  /** Reload the app with the new update */
  applyUpdate: () => Promise<void>;
}

// ── Cooldown: don't re-check more often than 5 min ───────────
const COOLDOWN_MS = 5 * 60_000;

// ── Hook ──────────────────────────────────────────────────────

/**
 * useOTAUpdate
 *
 * Manages the full Expo OTA (Over-The-Air) update lifecycle:
 *  1. Checks for updates once on app launch.
 *  2. Also checks when the app returns from background (with cooldown).
 *  3. Exposes download + restart functions for the UI modal.
 *
 * Fails silently in all error cases — the app always continues.
 *
 * ⚠️  OTA updates only deliver JS/asset changes.
 *     Native module changes require a new EAS Build.
 *
 * ⚠️  In Expo Go / development builds, Updates.isEnabled is false.
 *     The hook returns `up-to-date` immediately in that case.
 */
export function useOTAUpdate(): OTAUpdateState {
  const [status, setStatus] = useState<OTAStatus>('idle');
  const [updateMessage, setUpdateMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);

  const hasCheckedRef  = useRef(false);
  const lastCheckRef   = useRef<number>(0);
  const appStateRef    = useRef<AppStateStatus>(AppState.currentState);

  // ── Check ──────────────────────────────────────────────────

  const checkForUpdate = useCallback(async () => {
    // Guard: only run in OTA-capable builds
    if (!Updates.isEnabled) {
      setStatus('up-to-date');
      setIsChecked(true);
      return;
    }

    // Cooldown: skip if checked recently
    const now = Date.now();
    if (now - lastCheckRef.current < COOLDOWN_MS && hasCheckedRef.current) {
      return;
    }

    lastCheckRef.current = now;
    hasCheckedRef.current = true;
    setStatus('checking');
    setError(null);

    try {
      const result = await Updates.checkForUpdateAsync();

      if (!result.isAvailable) {
        setStatus('up-to-date');
        setIsChecked(true);
        return;
      }

      // Extract message from update manifest if available
      const manifest = result.manifest as any;
      const message =
        manifest?.extra?.updateMessage ??
        manifest?.metadata?.updateMessage ??
        'A new update is available with improvements and bug fixes.';

      setUpdateMessage(message);
      setStatus('available');
      setIsChecked(true);
    } catch {
      // Network error, offline, server unavailable — app continues normally
      setStatus('error');
      setIsChecked(true);
    }
  }, []);

  // ── Download ───────────────────────────────────────────────

  const downloadUpdate = useCallback(async () => {
    if (status !== 'available') return;

    setStatus('downloading');
    setError(null);

    try {
      await Updates.fetchUpdateAsync();
      setStatus('ready');
    } catch {
      setError('Download failed. Please try again.');
      setStatus('available'); // Allow retry
    }
  }, [status]);

  // ── Apply / Restart ────────────────────────────────────────

  const applyUpdate = useCallback(async () => {
    if (status !== 'ready') return;
    try {
      await Updates.reloadAsync();
    } catch {
      setError('Could not restart the app. Please close and reopen it manually.');
    }
  }, [status]);

  // ── On mount: initial check ────────────────────────────────

  useEffect(() => {
    // Small delay so the app renders its first frame before doing network I/O
    const timer = setTimeout(() => {
      checkForUpdate();
    }, 1500);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── AppState: check on foreground resume (with cooldown) ───

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextState === 'active'
        ) {
          // App came back to foreground — re-check if cooldown has expired
          checkForUpdate();
        }
        appStateRef.current = nextState;
      }
    );

    return () => subscription.remove();
  }, [checkForUpdate]);

  return {
    status,
    updateMessage,
    error,
    isChecked,
    checkForUpdate,
    downloadUpdate,
    applyUpdate,
  };
}
