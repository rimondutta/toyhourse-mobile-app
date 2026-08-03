import { useQuery } from '@tanstack/react-query';
import { getProduct } from '@/lib/api';
import type { Product } from '@/types/product';

/**
 * Fetches a single product by MongoDB _id (or slug) from GET /api/products/[id].
 * Returns the full variation data: variationTypes[], variants[].combination[].
 */
export const useProduct = (productId: string) => {
  return useQuery<Product>({
    queryKey: ['product', productId],
    queryFn: async () => {
      const res = await getProduct(productId);
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch product');
      return res.data;
    },
    enabled: !!productId,
    staleTime: 30_000,
  });
};
