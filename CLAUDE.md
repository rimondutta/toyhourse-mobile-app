# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on Android emulator/device
npx expo start --android

# Run on iOS simulator/device
npx expo start --ios

# Run on web
npx expo start --web

# Lint code
npm run lint
```

## Project Overview

This is a React Native mobile app (Expo) for "Toyhourse" e-commerce store using TypeScript and expo-router for file-based routing.

## Architecture

### Navigation Structure

- **app/(auth)/** — Auth flow screens (login, register, forgot password, verify OTP)
- **app/(tabs)/** — Main tab navigation (home, search, cart, wishlist, profile)
- **app/(profile)/** — Profile section screens (addresses, orders, settings, etc.)
- **Dynamic routes**: `app/product/[id].tsx`, `app/blogs/[slug].tsx`
- **Modal**: `app/ai-assistant.tsx` (slide-up modal)

The root layout (`app/_layout.tsx`) wraps the app with:
- **AuthProvider** — manages auth state with JWT stored in SecureStore
- **QueryClientProvider** — TanStack Query for data fetching
- **Sentry** — error monitoring and session replay integration
- **AppSync** — handles OTA updates, app version checks, and cache invalidation

### Data Layer

**API Client** (`lib/api.ts`):
- Central Axios client pointing to `EXPO_PUBLIC_API_URL`
- Bearer token automatically attached via SecureStore interceptor
- Typed helpers for all endpoints

**Custom hooks** (`hooks/`):
- `useProducts()`, `useProduct()` — TanStack Query hooks for product data
- `useCart()` — Zustand store (persisted to AsyncStorage)
- `useOrders()`, `useAddressess()`, `useCategories()`, `useWishlist()`, `useNotifications()` — feature hooks
- `usePushNotifications()` — handles device token registration

**State Management**:
- **TanStack Query** — server state (products, orders, user data)
- **Zustand** — client-only state (cart is persisted via AsyncStorage)
- **React Context** — AuthContext for auth state

### Styling

- **NativeWind** (Tailwind CSS) with custom purple primary theme (`#8B5CF6`)
- Color palette defined in `tailwind.config.js`:
  - `primary`: purple shades (DEFAULT: `#8B5CF6`)
  - `background`: light lavender (`#F9F5FF`)
  - `text.primary`: dark grey (`#1F2937`)
- Frosted glass UI patterns using `expo-blur`

### Components

- Reusable components in `components/`: `SafeScreen`, `LoadingState`, `ErrorState`, `EmptyState`, etc.
- Feature-specific components in `features/`: AI assistant UI with liquid glass effects
- Custom tab bar with animated active state and frosted glass (`app/(tabs)/_layout.tsx`)

## Key Patterns

**Screen components**: Use `useProducts`, `useCart`, and other hooks for data. Handle loading/error states with `LoadingState`, `ErrorState` components.

**Adding a new feature**:
1. Add API function in `lib/api.ts`
2. Create a hook in `hooks/useFeature.ts`
3. Create screen in appropriate `app/(section)/` folder
4. Add TanStack Query cache invalidation on mutations

**TanStack Query**: Queries use `placeholderData: keepPreviousData` to prevent flickering during category/sort changes. Default `staleTime: 5 minutes`.

**Sentry**: Already integrated in root layout. Errors from React Query are auto-captured. Use `Sentry.setUser()` in auth flows.

## Environment Variables

Copy `.env.example` to `.env`:
- `EXPO_PUBLIC_API_URL` — backend API URL
- `EXPO_PUBLIC_SENTRY_DSN` — Sentry DSN
- `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID` — Google OAuth (optional)

## Common Issues

- Android emulator requires local IP (not localhost) for API calls
- OTA updates via `expo-updates` require EAS Build
- Sentry source maps upload handled automatically by Expo