import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { useApiClient } from "~/../utils/api-client";

/**
 * @file Cart composables
 * @description API hooks for cart operations
 */

/**
 * @brief Fetch current customer's cart
 * @return Query result with cart data
 */
export function useCart() {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/cart");
      if (error) throw error;
      return data;
    },
  });
}

/**
 * @brief Add item to cart mutation
 * @return Mutation for adding items to cart
 */
export function useAddToCart() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: {
      menuItemId: string;
      restaurantId: string;
      name: string;
      price: number;
      currency: string;
      quantity: number;
    }) => {
      const { data, error } = await apiClient.POST("/api/cart/items", {
        body: {
          ...item,
          price: Number(item.price),
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate cart query to refetch
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

/**
 * @brief Update item quantity mutation
 * @return Mutation for updating item quantity
 */
export function useUpdateCartItemQuantity() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { menuItemId: string; quantity: number }) => {
      const { data, error } = await apiClient.PATCH("/api/cart/items", {
        body: params,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

/**
 * @brief Remove item from cart mutation
 * @return Mutation for removing items from cart
 */
export function useRemoveFromCart() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (menuItemId: string) => {
      const { data, error } = await apiClient.DELETE("/api/cart/items", {
        body: { menuItemId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

/**
 * @brief Clear cart mutation
 * @return Mutation for clearing the entire cart
 */
export function useClearCart() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await apiClient.DELETE("/api/cart");
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

/**
 * @brief Checkout cart mutation
 * @return Mutation for checking out the cart
 */
export function useCheckoutCart() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (checkout: {
      deliveryAddress: {
        street: string;
        city: string;
        postalCode: string;
        country: string;
        latitude?: number;
        longitude?: number;
        instructions?: string;
      };
      deliveryFee: number;
    }) => {
      const { data, error } = await apiClient.POST("/api/cart/checkout", {
        body: checkout,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
