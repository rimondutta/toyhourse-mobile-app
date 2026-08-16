import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { Order } from "@/types";
import { useAuth } from "@/context/AuthContext";

export const useOrders = () => {
  const { user } = useAuth();

  return useQuery<Order[]>({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      // Bearer token is automatically attached by the global interceptor in api.ts.
      // Real endpoint: GET /api/store/orders/user
      // Response: { success: true, orders: Order[] }
      const { data } = await apiClient.get("/store/orders/user");
      return data.orders ?? data.data ?? [];
    },
    enabled: !!user,
    staleTime: 30_000,
  });
};
