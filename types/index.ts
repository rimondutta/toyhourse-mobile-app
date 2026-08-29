/**
 * Mobile app type barrel.
 *
 * All product/category/variation types live in ./product.ts
 * (mirroring the Next.js MongoDB schema precisely).
 * Other domain types (Order, Cart, User) are defined here.
 */

// Re-export everything from the product types file
export * from './product';
import type { Product } from './product';

// ─────────────────────────────────────────────────────────────
// User / Auth (mobile-specific, managed by the Next.js backend)
// ─────────────────────────────────────────────────────────────

export interface MobileUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'customer';
}

// ─────────────────────────────────────────────────────────────
// Address
// ─────────────────────────────────────────────────────────────

export interface Address {
  _id: string;
  label: string;
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  isDefault: boolean;
}

// ─────────────────────────────────────────────────────────────
// Order
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// Order  (matches /api/store/orders/user response exactly)
// ─────────────────────────────────────────────────────────────

export interface OrderItem {
  _id: string;
  product: string;    // product ObjectId
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type FulfillmentStatus = 'unfulfilled' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod' | 'bkash' | 'card';

export interface CourierInfo {
  name: string;
  code: string;
  trackingId?: string;
  trackingUrl?: string;
}

export interface TrackingStep {
  key: string;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
  timestamp?: string;
}

export interface TrackingTimelineItem {
  status: string;
  title: string;
  description: string;
  location?: string;
  timestamp: string;
}

export interface Order {
  _id: string;
  customerName: string;
  customerEmail?: string;
  items: OrderItem[];
  totalAmount: number;
  shippingCost: number;
  shippingZone?: string;
  shippingAddress: {
    addressLine1: string;
    city: string;
    postcode?: string;
    phone: string;
    country?: string;
  };
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  courierStatus?: string;
  courier?: CourierInfo;
  estimatedDeliveryDate?: string;
  steps?: TrackingStep[];
  timeline?: TrackingTimelineItem[];
  notes?: string;
  invoiceNumber?: string;
  invoiceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────
// Cart
// ─────────────────────────────────────────────────────────────

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  clerkId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}
