import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/lib/api';
import type { Product, ProductsQueryParams } from '@/types/product';

/**
 * Fetches the paginated product list from GET /api/products.
 *
 * @param params - Optional query params: category, search, sort, page, limit, minPrice, maxPrice
 */
const useProducts = (params: ProductsQueryParams = {}) => {
  return useQuery<Product[]>({
    queryKey: ['products', params],
    queryFn: async () => {
      const res = await getProducts(params);
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch products');
      return res.data;
    },
    // Keep data fresh — products change when admin edits them.
    // The useLastUpdated hook handles proactive invalidation.
    staleTime: 30_000, // 30 seconds
  });
};

export default useProducts;
