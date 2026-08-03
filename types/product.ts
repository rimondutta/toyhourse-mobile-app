/**
 * Product types — mirrors website/src/models/Product.ts, VariationType.ts,
 * and VariationValue.ts exactly. Keep both in sync when the schema changes.
 *
 * These types describe the JSON shape returned by:
 *   GET /api/products
 *   GET /api/products/[id]
 */

// ─────────────────────────────────────────────────────────────
// Variation system
// ─────────────────────────────────────────────────────────────

export interface VariationType {
  _id: string;
  name: string;
  slug: string;
  /** Controls how the selector renders: swatch=color circles, button=pills, dropdown=<select> */
  displayType: 'swatch' | 'button' | 'dropdown';
  createdAt: string;
  updatedAt: string;
}

export interface VariationValue {
  _id: string;
  variationType: string | VariationType; // ObjectId or populated
  value: string;
  slug: string;
  /** Only relevant when parent VariationType.displayType === 'swatch' */
  colorHex: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface VariantCombinationSlot {
  variationType: VariationType;
  variationValue: VariationValue;
}

/** A single variant — a unique combination of option values (e.g. Red / Large) */
export interface ProductVariant {
  _id: string;
  sku: string;
  /** Human-readable label e.g. "Red / M" */
  combinationLabel: string;
  combination: VariantCombinationSlot[];
  price: number;
  comparePrice: number | null;
  stock: number;
  /** Cloudinary URLs specific to this variant (e.g. red product photos) */
  images: string[];
  isActive: boolean;
}

// ─────────────────────────────────────────────────────────────
// Category
// ─────────────────────────────────────────────────────────────

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────
// Product image
// ─────────────────────────────────────────────────────────────

export interface ProductImage {
  url: string;
  alt?: string;
}

// ─────────────────────────────────────────────────────────────
// Product (mirrors Product.ts Mongoose schema)
// ─────────────────────────────────────────────────────────────

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  longDescription?: string;
  price: number;
  compareAtPrice?: number;
  category: Category;

  // Legacy flat fields (still present on older products)
  attributes?: { name: string; value: string }[];
  tags: string[];

  images: ProductImage[];
  badge?: string;      // e.g. 'New', 'Best Seller'
  ageRange?: string;   // e.g. '3-5', '5-8'
  inventory: number;
  isPublished: boolean;

  // Review summary (denormalized on the product)
  rating: number;
  reviewCount: number;

  // ── Dynamic variation system ──
  /** When false: use price / inventory / images directly.
   *  When true: all pricing & stock come from variants[]. */
  hasVariations: boolean;
  variationTypes: VariationType[];
  variants: ProductVariant[];

  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────
// API response wrappers
// ─────────────────────────────────────────────────────────────

export interface ApiResponseMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Standard response envelope from every /api/* route */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: ApiResponseMeta;
  error?: string;
}

// ─────────────────────────────────────────────────────────────
// Query params for GET /api/products
// ─────────────────────────────────────────────────────────────

export interface ProductsQueryParams {
  category?: string;
  search?: string;
  sort?: 'newest' | 'price-asc' | 'price-desc';
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
}

// ─────────────────────────────────────────────────────────────
// Sync endpoint
// ─────────────────────────────────────────────────────────────

export interface LastUpdatedResponse {
  /** Unix milliseconds timestamp — changes on every product write */
  timestamp: number;
  /** ISO 8601 string for human readability */
  iso: string | null;
}

// ─────────────────────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────────────────────

/**
 * Given a product and a selected variant, returns the display price.
 * Falls back to the base product price for non-variation products.
 */
export function getEffectivePrice(
  product: Product,
  selectedVariant?: ProductVariant | null
): number {
  if (product.hasVariations && selectedVariant) {
    return selectedVariant.price;
  }
  return product.price;
}

/**
 * Given a product and a selected variant, returns the available stock.
 */
export function getEffectiveStock(
  product: Product,
  selectedVariant?: ProductVariant | null
): number {
  if (product.hasVariations && selectedVariant) {
    return selectedVariant.stock;
  }
  return product.inventory;
}

/**
 * Given a product and a selected variant, returns the display images.
 * Falls back to the product-level images if the variant has none.
 */
export function getEffectiveImages(
  product: Product,
  selectedVariant?: ProductVariant | null
): string[] {
  if (
    product.hasVariations &&
    selectedVariant &&
    selectedVariant.images.length > 0
  ) {
    return selectedVariant.images;
  }
  // Fall back to product-level images (extract url from { url, alt })
  return product.images.map((img) => img.url).filter(Boolean);
}
