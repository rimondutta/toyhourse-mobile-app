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

// ── Hook ──────────────────────────────────────────────────────

/**
 * useOTAUpdate (Modern SDK 50+ Implementation)
 *
 * Observes the native Expo Updates state using useUpdates().
 * Works seamlessly with app.json checkAutomatically: "ON_LOAD".
 */
export function useOTAUpdate(): OTAUpdateState {
  // Guard: if not OTA-capable (e.g. Expo Go)
  if (!Updates.isEnabled) {
    return {
      status: 'up-to-date',
      updateMessage: '',
      error: null,
      isChecked: true,
      checkForUpdate: async () => {},
      downloadUpdate: async () => {},
      applyUpdate: async () => {},
    };
  }

  // Modern hook provided by expo-updates SDK 50+
  const {
    currentlyRunning,
    isUpdateAvailable,
    isUpdatePending,
    isChecking,
    isDownloading,
    availableUpdate,
    checkError,
    downloadError,
  } = Updates.useUpdates();

  // Manual state overrides for when the user clicks the button
  const [manualDownloading, setManualDownloading] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  let status: OTAStatus = 'idle';
  
  if (isUpdatePending) {
    status = 'ready';
  } else if (isDownloading || manualDownloading) {
    status = 'downloading';
  } else if (isChecking) {
    status = 'checking';
  } else if (isUpdateAvailable) {
    status = 'available';
  } else if (checkError || downloadError || manualError) {
    status = 'error';
  } else {
    status = 'up-to-date';
  }

  // Use the error message if any
  const errorMsg = manualError || downloadError?.message || checkError?.message || null;

  // Extract update message from manifest if available
  const manifest = availableUpdate?.manifest as any;
  const updateMessage =
    manifest?.extra?.updateMessage ??
    manifest?.metadata?.updateMessage ??
    'A new update is available with improvements and bug fixes.';

  // In ON_LOAD mode, we typically don't need to manually check/fetch, but we expose them just in case
  const checkForUpdate = async () => {
    try {
      setManualError(null);
      await Updates.checkForUpdateAsync();
    } catch (e: any) {
      setManualError(e.message || 'Failed to check for updates.');
    }
  };

  const downloadUpdate = async () => {
    try {
      setManualError(null);
      setManualDownloading(true);
      await Updates.fetchUpdateAsync();
      setManualDownloading(false);
    } catch (e: any) {
      // If it throws because the native side is already downloading it,
      // we don't want to show a scary error. We just wait for isUpdatePending.
      if (e.message?.includes('already') || e.message?.includes('progress')) {
        // Just stay in downloading state, the useUpdates hook will trigger isUpdatePending when ready
        return;
      }
      setManualError(e.message || 'Download failed. Please try again.');
      setManualDownloading(false);
    }
  };

  const applyUpdate = async () => {
    try {
      await Updates.reloadAsync();
    } catch {
      // Ignored
    }
  };

  return {
    status,
    updateMessage,
    error: errorMsg,
    isChecked: !isChecking, // Considered checked once not checking
    checkForUpdate,
    downloadUpdate,
    applyUpdate,
  };
}
