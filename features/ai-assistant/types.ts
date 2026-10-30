/**
 * AI Assistant — shared types
 *
 * ChatMessage  — one turn in the conversation (user or assistant)
 * RecommendedProduct — a product surfaced by the AI or live product search
 */

export interface ChatMessage {
  /** Unique id for this message — used as FlatList key and for stream-append targeting */
  id: string;
  role: 'user' | 'assistant';
  content: string;
  /** True while the assistant is still receiving tokens for this message */
  isStreaming?: boolean;
  /**
   * Products extracted from the AI's markdown links or tool call outputs.
   */
  products?: RecommendedProduct[];
}

export interface RecommendedProduct {
  /** MongoDB _id (optional, fallback to slug) */
  id?: string;
  /** Display name of the product */
  name: string;
  /** URL slug — used for navigation: router.push('/product/' + slug) */
  slug: string;
  /** Price in BDT (৳) */
  price: number;
  /** Compare-at/original price if on sale */
  compareAtPrice?: number;
  /** Availability */
  inStock: boolean;
  /** Badge e.g. 'New', 'Best Seller', 'Sale' */
  badge?: string;
  /** Product primary image URL */
  image?: string;
  /** Average customer rating e.g. 4.8 */
  rating?: number;
  /** Total review count */
  reviewCount?: number;
  /** Product category name */
  category?: string;
}
