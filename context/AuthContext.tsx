/**
 * AuthContext
 *
 * Central auth state for the mobile app. Replaces all Clerk hooks.
 * Stores a custom JWT (issued by /api/auth/mobile/login) in SecureStore
 * and exposes a React context consumed by every screen that needs user info.
 *
 * Lifecycle:
 * 1. On mount, checks SecureStore for a saved token
 * 2. If token exists, calls /api/auth/mobile/me to validate + hydrate user
 * 3. On login(), saves the token and sets user state
 * 4. On signOut(), clears the token and resets state
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import {
  login as apiLogin,
  register as apiRegister,
  getMe,
  saveAdminToken,
  clearAdminToken,
  SECURE_STORE_TOKEN_KEY,
} from '@/lib/api';
import type { AuthUser } from '@/lib/api';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** The authenticated user, or null if not signed in */
  user: AuthUser | null;
  /** The raw JWT string, or null */
  token: string | null;
  /** True once the initial SecureStore check is done */
  isLoaded: boolean;
  /** True when the user has a valid JWT OR has chosen to browse as guest */
  isSignedIn: boolean;
  /** True specifically when the user is browsing without an account */
  isGuest: boolean;
  /** Skip login and browse as a guest */
  continueAsGuest: () => void;
  /** Sign in with email + password */
  signIn: (email: string, password: string) => Promise<void>;
  /** Register a new customer account, then sign in automatically */
  signUp: (name: string, email: string, password: string) => Promise<void>;
  /** Clear the stored token and reset state */
  signOut: () => Promise<void>;
  /** Refresh user data from the server (e.g. after a profile update) */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────

import { usePushNotifications } from '@/hooks/usePushNotifications';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  // Hook for push notifications — only the token is needed here for backend registration.
  // The full notification history is consumed directly via usePushNotifications() on the Notifications screen.
  const { expoPushToken } = usePushNotifications();

  // On mount: read saved token and validate it
  useEffect(() => {
    (async () => {
      try {
        const savedToken = await SecureStore.getItemAsync(SECURE_STORE_TOKEN_KEY);
        if (savedToken) {
          // Validate token and hydrate user from the server
          const res = await getMe();
          if (res.success) {
            setToken(savedToken);
            setUser(res.data);
          } else {
            // Token is expired or invalid — clear it
            await SecureStore.deleteItemAsync(SECURE_STORE_TOKEN_KEY);
          }
        }
      } catch {
        // Network error on startup: keep token, user will be null until next successful call
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  // Register push token with backend when user is signed in and token is available
  useEffect(() => {
    if (token && expoPushToken && user) {
      fetch(`${process.env.EXPO_PUBLIC_API_URL ?? 'https://toyhourse.vercel.app/api'}/mobile/push-token`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token: expoPushToken }),
      }).catch(err => console.error('Failed to register push token:', err));
    }
  }, [token, expoPushToken, user]);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    if (!res.success) {
      throw new Error(res.error ?? 'Login failed');
    }
    await saveAdminToken(res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const regRes = await apiRegister(name, email, password);
    if (!regRes.success) {
      throw new Error(regRes.error ?? 'Registration failed');
    }
    // Auto sign-in after successful registration
    await signIn(email, password);
  }, [signIn]);

  const continueAsGuest = useCallback(() => {
    setIsGuest(true);
  }, []);

  const signOut = useCallback(async () => {
    await clearAdminToken();
    setToken(null);
    setUser(null);
    setIsGuest(false);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await getMe();
      if (res.success) setUser(res.data);
    } catch {
      // Silently fail — user data stays stale until next refresh
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoaded,
        isSignedIn: !!token || isGuest,
        isGuest,
        continueAsGuest,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

/**
 * useAuth — consume the AuthContext.
 * Must be used inside an <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
