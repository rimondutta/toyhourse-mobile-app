import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { Order } from "@/types";

export const useOrders = () => {
  const api = apiClient;

  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await api.get("/orders");
      return data.orders;
    },
  });
};
