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
import { useState } from "react";
import AppUpdateModal from "@/components/AppUpdateModal";
import { StatusBar } from "expo-status-bar";

/**
 * AppSync — mounts once at the root.
 * Runs background tasks that must not affect the navigation tree:
 *  1. useLastUpdated   — polls for product cache invalidation
 *  2. useAppUpdate     — single version check on each app launch
 */
function AppSync() {
  useLastUpdated();

  const { updateType, config, installedVersion, isChecked } = useAppUpdate();
  const [dismissed, setDismissed] = useState(false);

  // Only show modal once isChecked and there is an update to show
  const showModal = isChecked && !!updateType && !!config && !dismissed;

  return (
    <>
      {showModal && config && (
        <AppUpdateModal
          visible={showModal}
          updateType={updateType}
          config={config}
          installedVersion={installedVersion}
          onDismiss={() => setDismissed(true)}
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
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#F8FAFC" },
          }}
        />
      </QueryClientProvider>
    </AuthProvider>
  );
});
