import { useEffect, useRef, useState } from 'react';
import { Linking, Alert } from 'react-native';
import Constants from 'expo-constants';

// ── Types ─────────────────────────────────────────────────────

export interface AppVersionConfig {
  latestVersion: string;
  minimumVersion: string;
  forceUpdate: boolean;
  updateMessage: string;
  androidUrl: string;
}

export type UpdateType = 'optional' | 'forced' | null;

export interface AppUpdateState {
  /** Whether the check has completed (success or fail) */
  isChecked: boolean;
  /** null = no update needed */
  updateType: UpdateType;
  config: AppVersionConfig | null;
  /** Currently installed version string (from app.json / EAS build) */
  installedVersion: string;
}

// ── Semver comparison ─────────────────────────────────────────

/**
 * Compares two semver strings (major.minor.patch).
 * Returns:
 *  1 if a > b
 * -1 if a < b
 *  0 if equal
 *
 * Examples:
 *  compare("1.0.10", "1.0.9")  → 1
 *  compare("1.1.0",  "1.0.9")  → 1
 *  compare("1.0.0",  "1.0.0")  → 0
 */
export function compareSemver(a: string, b: string): 1 | 0 | -1 {
  const parse = (v: string) =>
    v.split('.').map((n) => parseInt(n, 10));

  const [aMaj, aMin, aPatch] = parse(a);
  const [bMaj, bMin, bPatch] = parse(b);

  if (aMaj !== bMaj) return aMaj > bMaj ? 1 : -1;
  if (aMin !== bMin) return aMin > bMin ? 1 : -1;
  if (aPatch !== bPatch) return aPatch > bPatch ? 1 : -1;
  return 0;
}

// ── API call ──────────────────────────────────────────────────

const API_URL =
  (process.env.EXPO_PUBLIC_API_URL ?? 'https://toyhourse.vercel.app/api') +
  '/mobile/app-version';

const FETCH_TIMEOUT_MS = 8_000;

async function fetchVersionConfig(): Promise<AppVersionConfig> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(API_URL, {
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data as AppVersionConfig;
  } finally {
    clearTimeout(timer);
  }
}

// ── Hook ──────────────────────────────────────────────────────

/**
 * useAppUpdate
 *
 * Checks once on app launch whether a newer version is available.
 * Never fires more than once per app session (guarded by `hasChecked` ref).
 * Fails silently on network error / timeout / offline — app continues normally.
 *
 * Usage: mount once in the root layout via <AppUpdateChecker /> component.
 */
export function useAppUpdate(): AppUpdateState {
  const hasChecked = useRef(false);

  // Get the installed version from Expo Constants (reads expo.version in app.json)
  const installedVersion: string =
    Constants.expoConfig?.version ?? '1.0.0';

  const [state, setState] = useState<AppUpdateState>({
    isChecked: false,
    updateType: null,
    config: null,
    installedVersion,
  });

  useEffect(() => {
    // Guard: only run once per app session
    if (hasChecked.current) return;
    hasChecked.current = true;

    (async () => {
      try {
        const config = await fetchVersionConfig();

        // Basic validation
        const semverPattern = /^\d+\.\d+\.\d+$/;
        if (
          !semverPattern.test(config.latestVersion) ||
          !semverPattern.test(config.minimumVersion)
        ) {
          // Malformed response — don't block the app
          setState((s) => ({ ...s, isChecked: true }));
          return;
        }

        // Determine update type
        const isForced =
          config.forceUpdate ||
          compareSemver(installedVersion, config.minimumVersion) < 0;

        const isOptional =
          !isForced &&
          compareSemver(config.latestVersion, installedVersion) > 0;

        setState({
          isChecked: true,
          updateType: isForced ? 'forced' : isOptional ? 'optional' : null,
          config,
          installedVersion,
        });
      } catch {
        // Network error, timeout, offline — allow app to continue normally
        setState((s) => ({ ...s, isChecked: true }));
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}

// ── Utility: open update URL ──────────────────────────────────

export async function openUpdateUrl(url: string): Promise<void> {
  try {
    if (!url.startsWith('https://')) {
      Alert.alert('Error', 'Invalid update URL. Please contact support.');
      return;
    }
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        'Cannot Open Link',
        'Please visit toyhourse.vercel.app to download the latest version.'
      );
    }
  } catch {
    Alert.alert(
      'Error',
      'Could not open the update page. Please try again later.'
    );
  }
}
