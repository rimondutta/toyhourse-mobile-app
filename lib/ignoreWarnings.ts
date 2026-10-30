import { LogBox } from "react-native";

LogBox.ignoreLogs([
  "SafeAreaView has been deprecated and will be removed in a future release. Please use 'react-native-safe-area-context' instead.",
  "SafeAreaView has been deprecated",
]);

if (__DEV__) {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("SafeAreaView has been deprecated")
    ) {
      return;
    }
    originalWarn(...args);
  };
}

