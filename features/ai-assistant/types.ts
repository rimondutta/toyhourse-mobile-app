/**
 * AI Assistant — shared types
 *
 * ChatMessage  — one turn in the conversation (user or assistant)
 * RecommendedProduct — a product surface by the AI, extracted from its markdown
 */

export interface ChatMessage {
  /** Unique id for this message — used as FlatList key and for stream-append targeting */
  id: string;
  role: 'user' | 'assistant';
  content: string;
  /** True while the assistant is still receiving tokens for this message */
  isStreaming?: boolean;
  /**
   * Products extracted from the AI's markdown links, e.g. [Toy Name](/products/slug).
   * Populated after streaming finishes.
   */
  products?: RecommendedProduct[];
}

export interface RecommendedProduct {
  /** Display name from the AI's response */
  name: string;
  /**
   * URL slug — used for navigation: router.push('/product/' + slug)
   * TODO: Confirm the product screen accepts slug as [id] param.
   * Based on /api/products/[id], the backend resolves both _id and slug.
   */
  slug: string;
  /** Price in BDT extracted from the AI text (0 if not parseable) */
  price: number;
  inStock: boolean;
  badge?: string;
}
