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

export interface OrderItem {
  _id: string;
  product: Product;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  _id: string;
  user: string;
  clerkId: string;
  orderItems: OrderItem[];
  shippingAddress: {
    fullName: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    phoneNumber: string;
  };
  paymentResult: {
    id: string;
    status: string;
  };
  totalPrice: number;
  status: "pending" | "shipped" | "delivered";
  hasReviewed: boolean;
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
