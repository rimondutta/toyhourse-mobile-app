import { useQuery, keepPreviousData } from '@tanstack/react-query';
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
    // Keep previous data when changing params (e.g. changing category) to prevent flickering
    placeholderData: keepPreviousData,
    // Keep data fresh longer — useLastUpdated handles proactive invalidation
    staleTime: 300_000, // 5 minutes
  });
};

export default useProducts;
