import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { useApiClient } from "~/../utils/api-client";

/**
 * @file Orders composables
 * @description API hooks for order operations
 */

/**
 * @brief Fetch user's orders
 * @return Query result with orders
 */
export function useOrders() {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/orders/my-orders");
      if (error) throw error;
      return data;
    },
  });
}

/**
 * @brief Fetch single order by ID
 * @param id Order ID
 * @return Query result with order data
 */
export function useOrder(id: Ref<string> | string) {
  const apiClient = useApiClient();
  const orderId = isRef(id) ? id : ref(id);

  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/orders/{id}", {
        params: { path: { id: orderId.value } },
      });
      if (error) throw error;
      return data;
    },
    enabled: computed(() => !!orderId.value),
  });
}

/**
 * @brief Create order mutation
 * @return Mutation for creating an order
 */
export function useCreateOrder() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (orderData: {
      restaurantId: string;
      deliveryAddressId: string;
      items: Array<{ menuItemId: string; quantity: number }>;
    }) => {
      const { data, error } = await apiClient.POST("/api/orders", {
        body: orderData,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      if (data?.id) {
        router.push(`/orders/${data.id}`);
      }
    },
  });
}

/**
 * @brief Pay for order mutation
 * @return Mutation for paying for an order
 */
export function usePayForOrder() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { orderId: string; paymentMethod: string }) => {
      const { data, error } = await apiClient.POST("/api/orders/{id}/pay", {
        params: { path: { id: params.orderId } },
        body: { paymentMethod: params.paymentMethod },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.orderId] });
    },
  });
}

/**
 * @brief Cancel order mutation
 * @return Mutation for cancelling an order
 */
export function useCancelOrder() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await apiClient.POST("/api/orders/{id}/cancel", {
        params: { path: { id: orderId } },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    },
  });
}
