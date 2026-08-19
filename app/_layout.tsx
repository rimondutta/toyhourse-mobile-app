import { Stack } from "expo-router";
import "../global.css";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import * as Sentry from "@sentry/react-native";
import { LogBox } from "react-native";

LogBox.ignoreLogs([
  "SafeAreaView has been deprecated and will be removed in a future release. Please use 'react-native-safe-area-context' instead.",
]);

Sentry.init({
  dsn: "https://fb6731b90610cc08333e6c16ffac5724@o4509813037137920.ingest.de.sentry.io/4510451611205712",
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],
});

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any, query) => {
      Sentry.captureException(error, {
        tags: {
          type: "react-query-error",
          queryKey: query.queryKey[0]?.toString() || "unknown",
        },
        extra: {
          errorMessage: error.message,
          statusCode: error.response?.status,
          queryKey: query.queryKey,
        },
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      Sentry.captureException(error, {
        tags: { type: "react-query-mutation-error" },
        extra: {
          errorMessage: error.message,
          statusCode: error.response?.status,
        },
      });
    },
  }),
});

import { useLastUpdated } from "@/hooks/useLastUpdated";
import { useAppUpdate } from "@/hooks/useAppUpdate";
import { useOTAUpdate } from "@/hooks/useOTAUpdate";
import { useState } from "react";
import AppUpdateModal from "@/components/AppUpdateModal";
import OTAUpdateModal from "@/components/OTAUpdateModal";
import { StatusBar } from "expo-status-bar";

// ── Environment flag: set EXPO_PUBLIC_FORCE_OTA_UPDATE=true to enforce ──────
const FORCE_OTA_UPDATE =
  process.env.EXPO_PUBLIC_FORCE_OTA_UPDATE === "true";

/**
 * AppSync — mounts once at the root level.
 *
 * Manages three background systems without affecting navigation:
 *  1. useLastUpdated — polls the backend to invalidate stale product cache
 *  2. useAppUpdate   — checks for native APK version updates via the backend API
 *  3. useOTAUpdate   — checks for Expo OTA JS/asset updates via expo-updates
 *
 * Priority: OTA modal is only shown if there is no native app update pending.
 * This prevents two update modals from appearing simultaneously.
 */
function AppSync() {
  useLastUpdated();

  // ── Native app version check (APK update) ─────────────────
  const appUpdate = useAppUpdate();
  const [appUpdateDismissed, setAppUpdateDismissed] = useState(false);
  const showAppUpdateModal =
    appUpdate.isChecked &&
    !!appUpdate.updateType &&
    !!appUpdate.config &&
    !appUpdateDismissed;

  // ── OTA update check (JS/asset update via expo-updates) ───
  const ota = useOTAUpdate();
  const [otaDismissed, setOtaDismissed] = useState(false);
  // Only show OTA modal if:
  //  - OTA check is complete
  //  - There is an update (available, downloading, ready, error)
  //  - Native app update modal is NOT showing (avoid two modals at once)
  //  - User hasn't dismissed it
  const showOTAModal =
    ota.isChecked &&
    (ota.status === "available" ||
      ota.status === "downloading" ||
      ota.status === "ready" ||
      (ota.status === "error" && !!ota.error)) &&
    !showAppUpdateModal &&
    !otaDismissed;

  return (
    <>
      {/* Native APK update modal */}
      {showAppUpdateModal && appUpdate.config && (
        <AppUpdateModal
          visible={showAppUpdateModal}
          updateType={appUpdate.updateType}
          config={appUpdate.config}
          installedVersion={appUpdate.installedVersion}
          onDismiss={() => setAppUpdateDismissed(true)}
        />
      )}

      {/* OTA JS/asset update modal */}
      {showOTAModal && (
        <OTAUpdateModal
          visible={showOTAModal}
          status={ota.status}
          updateMessage={ota.updateMessage}
          error={ota.error}
          forceUpdate={FORCE_OTA_UPDATE}
          onDownload={ota.downloadUpdate}
          onApply={ota.applyUpdate}
          onDismiss={() => setOtaDismissed(true)}
        />
      )}
    </>
  );
}

export default Sentry.wrap(function RootLayout() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <AppSync />
        <StatusBar style="dark" />
        <Stack
          initialRouteName="(tabs)"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#F8FAFC" },
          }}
        />
      </QueryClientProvider>
    </AuthProvider>
  );
});
