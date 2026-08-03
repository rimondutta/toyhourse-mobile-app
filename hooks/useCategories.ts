import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/lib/api';
import type { Category } from '@/types/product';

/**
 * Fetches all active categories from GET /api/categories.
 * Cached for 5 minutes (categories rarely change).
 */
const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getCategories();
      if (!res.success) throw new Error(res.error ?? 'Failed to fetch categories');
      return res.data;
    },
    staleTime: 5 * 60_000, // 5 minutes — categories change rarely
  });
};

export default useCategories;
