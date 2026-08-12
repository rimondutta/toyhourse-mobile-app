import { Stack } from "expo-router";
import "../global.css";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import * as Sentry from "@sentry/react-native";
import { LogBox } from "react-native";

const filterWarning = (...args: any[]) => {
  const msg = args.map(a => (a instanceof Error ? a.message : String(a))).join(' ');
  return msg.includes('SafeAreaView has been deprecated');
};

const originalWarn = console.warn;
console.warn = (...args) => {
  if (filterWarning(...args)) return;
  originalWarn(...args);
};

const originalError = console.error;
console.error = (...args) => {
  if (filterWarning(...args)) return;
  originalError(...args);
};

const originalLog = console.log;
console.log = (...args) => {
  if (filterWarning(...args)) return;
  originalLog(...args);
};

LogBox.ignoreLogs([
  /SafeAreaView has been deprecated/,
]);


Sentry.init({
  dsn: "https://fb6731b90610cc08333e6c16ffac5724@o4509813037137920.ingest.de.sentry.io/4510451611205712",

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any, query) => {
      Sentry.captureException(error, {
        tags: {
          type: "react-query-error",
          queryKey: query.queryKey[0]?.toString() || "unknon",
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
      // global error handler for all mutations
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

function AppSync() {
  useLastUpdated();
  return null;
}

import { StatusBar } from "expo-status-bar";

export default Sentry.wrap(function RootLayout() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <AppSync />
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F8FAFC' } }} />
      </QueryClientProvider>
    </AuthProvider>
  );
});
