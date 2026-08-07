import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { Order } from "@/types";
import { useAuth } from "@/context/AuthContext";

export const useOrders = () => {
  const api = apiClient;
  const { user } = useAuth();

  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await api.get("/orders");
      return data.orders;
    },
    enabled: !!user,
  });
};
