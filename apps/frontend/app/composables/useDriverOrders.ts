import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useApiClient } from "~/../utils/api-client";

/**
 * @file Driver order composables
 * @description API hooks for driver order operations
 */

/**
 * @brief Fetch available orders for drivers
 * @return Query result with available orders
 */
export const useAvailableOrders = () => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["available-orders"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/orders/available");
      if (error) throw error;
      return data ?? [];
    },
  });
};

/**
 * @brief Fetch driver's deliveries
 * @return Query result with driver's assigned deliveries
 */
export const useMyDeliveries = () => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["my-deliveries"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/orders/my-deliveries");
      if (error) throw error;
      return data ?? [];
    },
  });
};

/**
 * @brief Accept an order mutation
 * @return Mutation for accepting an order
 */
export const useAcceptOrder = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      estimatedMinutes = 30,
    }: {
      orderId: string;
      estimatedMinutes?: number;
    }) => {
      const { data, error } = await apiClient.POST("/api/orders/{id}/accept", {
        params: {
          path: { id: orderId },
        },
        body: {
          estimatedMinutes,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["available-orders"] });
      queryClient.invalidateQueries({ queryKey: ["my-deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
  });
};

/**
 * @brief Update order status mutation
 * @return Mutation for updating order status
 */
export const useUpdateDeliveryStatus = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
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
          path: { id: orderId },
        },
        body: {
          status,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["my-deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
  });
};

/**
 * @brief Report issue with order (cancel)
 * @return Mutation for cancelling an order with a reason
 */
export const useReportIssue = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      reason,
    }: {
      orderId: string;
      reason: string;
    }) => {
      const { data, error } = await apiClient.POST("/api/orders/{id}/cancel", {
        params: {
          path: { id: orderId },
        },
        body: {
          reason,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["my-deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
  });
};
