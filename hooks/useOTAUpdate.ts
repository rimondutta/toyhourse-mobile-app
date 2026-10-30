import * as Updates from 'expo-updates';

export type OTAStatus =
  | 'idle'
  | 'checking'
  | 'up-to-date'
  | 'available'
  | 'downloading'
  | 'ready'
  | 'error';

export interface OTAUpdateState {
  status: OTAStatus;
  updateMessage: string;
  error: string | null;
  isChecked: boolean;
  checkForUpdate: () => Promise<void>;
  downloadUpdate: () => Promise<void>;
  applyUpdate: () => Promise<void>;
}

export function useOTAUpdate(): OTAUpdateState {
  const {
    isUpdateAvailable,
    isUpdatePending,
    isChecking,
    isDownloading,
    availableUpdate,
    checkError,
    downloadError,
  } = Updates.useUpdates();

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

  let status: OTAStatus = 'idle';

  if (isUpdatePending) {
    status = 'ready';
  } else if (isDownloading) {
    status = 'downloading';
  } else if (isChecking) {
    status = 'checking';
  } else if (isUpdateAvailable) {
    status = 'available';
  } else if (checkError || downloadError) {
    status = 'error';
  } else {
    status = 'up-to-date';
  }

  const errorMsg = downloadError?.message || checkError?.message || null;

  const manifest = availableUpdate?.manifest as any;
  const updateMessage =
    manifest?.extra?.updateMessage ??
    manifest?.metadata?.updateMessage ??
    'A new update is available with improvements and bug fixes.';

  const checkForUpdate = async () => {};

  const downloadUpdate = async () => {
    if (isDownloading) return;
    try {
      await Updates.fetchUpdateAsync();
    } catch {
      // Ignored
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
    isChecked: !isChecking,
    checkForUpdate,
    downloadUpdate,
    applyUpdate,
  };
}
