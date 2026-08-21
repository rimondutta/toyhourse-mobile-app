/**
 * Mobile API Client
 *
 * Central HTTP client for all Next.js API calls from the React Native app.
 * - Points to EXPO_PUBLIC_API_URL (set in .env)
 * - Reads the auth token from SecureStore (set after login via /api/auth/mobile/login)
 * - Exposes typed helper functions for every endpoint consumed by the app
 *
 * NOTE: This client is intentionally NOT Clerk-aware. The Next.js backend
 * uses its own JWT system (NEXTAUTH_SECRET). Clerk is still used for the
 * regular customer auth flow — this client handles admin-scoped actions
 * and all product/category data fetching (which requires no auth at all
 * for GET requests).
 */

import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';
import type {
  ApiResponse,
  Product,
  Category,
  ProductsQueryParams,
  LastUpdatedResponse,
} from '@/types';

// ── Constants ────────────────────────────────────────────────
export const SECURE_STORE_TOKEN_KEY = 'mobile_admin_token';
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://toyhourse.vercel.app/api';

// ── Axios instance ───────────────────────────────────────────
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

/**
 * Global request interceptor — automatically attaches the Bearer token
 * from SecureStore to every outgoing request. This fixes all 401 errors
 * for orders, addresses, and any other authenticated endpoints without
 * needing to manually pass headers in each hook.
 */
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync(SECURE_STORE_TOKEN_KEY);
    if (token) {
      config.headers = config.headers ?? {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {
    // SecureStore unavailable — proceed without auth header
  }
  return config;
});

/**
 * Attach Bearer token to any request that needs admin auth.
 * Call this at the top of admin-only request functions.
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await SecureStore.getItemAsync(SECURE_STORE_TOKEN_KEY);
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

// ── Auth helpers (admin JWT) ─────────────────────────────────

/** Save the JWT issued by /api/auth/mobile/login to SecureStore */
export async function saveAdminToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(SECURE_STORE_TOKEN_KEY, token);
}

/** Remove the admin JWT (logout) */
export async function clearAdminToken(): Promise<void> {
  await SecureStore.deleteItemAsync(SECURE_STORE_TOKEN_KEY);
}

/** Returns true if an admin token is currently stored */
export async function hasAdminToken(): Promise<boolean> {
  const token = await SecureStore.getItemAsync(SECURE_STORE_TOKEN_KEY);
  return !!token;
}

// ── Product API calls ─────────────────────────────────────────

/** GET /api/products — paginated, filtered product list */
export async function getProducts(
  params: ProductsQueryParams = {}
): Promise<ApiResponse<Product[]>> {
  const { data } = await apiClient.get<ApiResponse<Product[]>>('/products', { params });
  return data;
}
 
/** GET /api/products/[id] — single product by MongoDB _id or slug */
export async function getProduct(id: string): Promise<ApiResponse<Product>> {
  const { data } = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
  return data;
}

/** GET /api/products/last-updated — polling sync endpoint */
export async function getLastUpdated(): Promise<ApiResponse<LastUpdatedResponse>> {
  const { data } = await apiClient.get<ApiResponse<LastUpdatedResponse>>(
    '/products/last-updated'
  );
  return data;
}

// ── Category API calls ────────────────────────────────────────

/** GET /api/categories — all active categories */
export async function getCategories(): Promise<ApiResponse<Category[]>> {
  const { data } = await apiClient.get<ApiResponse<Category[]>>('/categories');
  return data;
}

// ── Admin product mutations (require Bearer token) ────────────

/** POST /api/products — create a product (admin only) */
export async function createProduct(
  productData: Partial<Product>
): Promise<ApiResponse<Product>> {
  const headers = await getAuthHeaders();
  const { data } = await apiClient.post<ApiResponse<Product>>(
    '/products',
    productData,
    { headers }
  );
  return data;
}

/** PUT /api/products/[id] — update a product (admin only) */
export async function updateProduct(
  id: string,
  productData: Partial<Product>
): Promise<ApiResponse<Product>> {
  const headers = await getAuthHeaders();
  const { data } = await apiClient.put<ApiResponse<Product>>(
    `/products/${id}`,
    productData,
    { headers }
  );
  return data;
}

/** DELETE /api/products/[id] — delete a product (admin only) */
export async function deleteProduct(id: string): Promise<ApiResponse<{ message: string }>> {
  const headers = await getAuthHeaders();
  const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(
    `/products/${id}`,
    { headers }
  );
  return data;
}

// ── Auth API helpers ──────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

/** POST /api/auth/mobile/login — exchange email+password for a JWT */
export async function login(
  email: string,
  password: string
): Promise<ApiResponse<LoginResponse>> {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
    '/auth/mobile/login',
    { email, password }
  );
  return data;
}

/** POST /api/auth/mobile/google — exchange Google access token for a JWT */
export async function googleLogin(
  accessToken: string
): Promise<ApiResponse<LoginResponse>> {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
    '/auth/mobile/google',
    { accessToken }
  );
  return data;
}

/** POST /api/auth/register — create a new customer account */
export async function register(
  name: string,
  email: string,
  password: string
): Promise<ApiResponse<{ userId: string; name: string; email: string }>> {
  const { data } = await apiClient.post<ApiResponse<{ userId: string; name: string; email: string }>>(
    '/auth/register',
    { name, email, password }
  );
  return data;
}

/** GET /api/auth/mobile/me — validate token and refresh user profile */
export async function getMe(): Promise<ApiResponse<AuthUser>> {
  const headers = await getAuthHeaders();
  const { data } = await apiClient.get<ApiResponse<AuthUser>>(
    '/auth/mobile/me',
    { headers }
  );
  return data;
}

/** PUT /api/auth/mobile/update-profile — update name / image */
export async function updateProfile(
  updates: { name?: string; image?: string }
): Promise<ApiResponse<AuthUser>> {
  const headers = await getAuthHeaders();
  const { data } = await apiClient.put<ApiResponse<AuthUser>>(
    '/auth/mobile/update-profile',
    updates,
    { headers }
  );
  return data;
};

// ── Forgot Password flow ──────────────────────────────────────

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyOtpResponse {
  resetToken: string;
}

/** POST /api/auth/forgot-password — request OTP */
export async function forgotPassword(
  email: string
): Promise<ApiResponse<ForgotPasswordResponse>> {
  const { data } = await apiClient.post<ApiResponse<ForgotPasswordResponse>>(
    '/auth/forgot-password',
    { email }
  );
  return data;
}

/** POST /api/auth/verify-reset-otp — verify OTP, get resetToken */
export async function verifyResetOtp(
  email: string,
  otp: string
): Promise<ApiResponse<VerifyOtpResponse>> {
  const { data } = await apiClient.post<ApiResponse<VerifyOtpResponse>>(
    '/auth/verify-reset-otp',
    { email, otp }
  );
  return data;
}

/** POST /api/auth/reset-password — set new password */
export async function resetPassword(
  resetToken: string,
  newPassword: string
): Promise<ApiResponse<{ message: string }>> {
  const { data } = await apiClient.post<ApiResponse<{ message: string }>>(
    '/auth/reset-password',
    { resetToken, newPassword }
  );
  return data;
}

// ── Notifications ─────────────────────────────────────────────

export interface AppNotification {
  _id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  orderId: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  data: AppNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/** GET /api/notifications — paginated notification list */
export async function getNotifications(
  page = 1,
  limit = 20
): Promise<ApiResponse<AppNotification[]> & { pagination?: NotificationListResponse['pagination'] }> {
  const headers = await getAuthHeaders();
  const { data } = await apiClient.get('/notifications', {
    params: { page, limit },
    headers,
  });
  return data;
}

/** GET /api/notifications/unread-count */
export async function getUnreadCount(): Promise<{ success: boolean; count: number }> {
  const headers = await getAuthHeaders();
  const { data } = await apiClient.get('/notifications/unread-count', { headers });
  return data;
}

/** PATCH /api/notifications/:id/read */
export async function markNotificationRead(id: string): Promise<ApiResponse<any>> {
  const headers = await getAuthHeaders();
  const { data } = await apiClient.patch(`/notifications/${id}/read`, {}, { headers });
  return data;
}

/** PATCH /api/notifications/read-all */
export async function markAllNotificationsRead(): Promise<ApiResponse<any>> {
  const headers = await getAuthHeaders();
  const { data } = await apiClient.patch('/notifications/read-all', {}, { headers });
  return data;
}

/** PATCH /api/mobile/push-token — register Expo push token */
export async function registerPushToken(pushToken: string): Promise<ApiResponse<any>> {
  const headers = await getAuthHeaders();
  const { data } = await apiClient.patch(
    '/mobile/push-token',
    { pushToken },
    { headers }
  );
  return data;
}

export default apiClient;
