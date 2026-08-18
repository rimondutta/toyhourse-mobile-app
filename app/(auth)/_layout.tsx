import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded, isGuest } = useAuth();

  if (!isLoaded) return null; // Wait for SecureStore check

  if (isSignedIn && !isGuest) {
    return <Redirect href={"/(tabs)"} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
