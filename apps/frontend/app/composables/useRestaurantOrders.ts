import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { useApiClient } from "~/../utils/api-client";
import { computed, unref, type MaybeRef } from "vue";

/**
 * @file Restaurant orders composables
 * @description API hooks for restaurant order management
 */

/**
 * @brief Fetch orders for a specific restaurant
 * @param restaurantId Restaurant ID (can be a ref or string)
 * @return Query result with orders
 */
export function useRestaurantOrders(restaurantId: MaybeRef<string>) {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["restaurant-orders", restaurantId],
    queryFn: async () => {
      const id = unref(restaurantId);
      const { data, error } = await apiClient.GET(
        "/api/orders/restaurant/{restaurantId}",
        {
          params: {
            path: { restaurantId: id },
          },
        },
      );
      if (error) throw error;
      return data ?? [];
    },
    enabled: computed(() => !!unref(restaurantId)),
  });
}

/**
 * @brief Confirm an order (restaurant confirms they received the order)
 * @return Mutation for confirming orders
 */
export function useConfirmOrder() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      restaurantId: string;
      orderId: string;
      estimatedPreparationMinutes?: number;
    }) => {
      const { data, error } = await apiClient.POST(
        "/api/restaurants/{restaurantId}/orders/{orderId}/confirm",
        {
          params: {
            path: {
              restaurantId: params.restaurantId,
              orderId: params.orderId,
            },
          },
          body: {
            estimatedPreparationMinutes:
              params.estimatedPreparationMinutes ?? 30,
          },
        },
      );
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.orderId] });
    },
  });
}

/**
 * @brief Reject an order
 * @return Mutation for rejecting orders
 */
export function useRejectOrder() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      restaurantId: string;
      orderId: string;
      reason: string;
    }) => {
      const { data, error } = await apiClient.POST(
        "/api/restaurants/{restaurantId}/orders/{orderId}/reject",
        {
          params: {
            path: {
              restaurantId: params.restaurantId,
              orderId: params.orderId,
            },
          },
          body: {
            reason: params.reason,
          },
        },
      );
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.orderId] });
    },
  });
}

/**
 * @brief Update order status (preparing, ready_for_pickup, etc.)
 * @return Mutation for updating order status
 */
export function useUpdateOrderStatus() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      orderId: string;
      status:
        | "pending"
        | "payment_succeeded"
        | "confirmed"
        | "preparing"
        | "ready_for_pickup"
        | "in_transit"
        | "delivered"
        | "cancelled";
    }) => {
      const { data, error } = await apiClient.PATCH("/api/orders/{id}/status", {
        params: {
          path: {
            id: params.orderId,
          },
        },
        body: {
          status: params.status,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
