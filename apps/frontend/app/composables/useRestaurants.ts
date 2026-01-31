import { useQuery } from "@tanstack/vue-query";
import { useApiClient } from "~~/utils/api-client";

/**
 * @file Restaurant composables
 * @description API hooks for restaurant operations
 */

/**
 * @brief Fetch all restaurants
 * @return Query result with restaurants data
 */
export function useRestaurants() {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ["restaurants"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/restaurants");
      if (error) throw error;
      return data;
    },
  });
}

/**
 * @brief Fetch single restaurant by ID
 * @param id Restaurant ID
 * @return Query result with restaurant data
 */
export function useRestaurant(id: Ref<string> | string) {
  const apiClient = useApiClient();
  const restaurantId = isRef(id) ? id : ref(id);

  return useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/restaurants/{id}", {
        params: { path: { id: restaurantId.value } },
      });
      if (error) throw error;
      return data;
    },
    enabled: computed(() => !!restaurantId.value),
  });
}

/**
 * @brief Fetch restaurant menu items
 * @param restaurantId Restaurant ID
 * @return Query result with menu items
 */
export function useMenuItems(restaurantId: Ref<string> | string) {
  const apiClient = useApiClient();
  const id = isRef(restaurantId) ? restaurantId : ref(restaurantId);

  return useQuery({
    queryKey: ["menu-items", id],
    queryFn: async () => {
      const { data, error } = await apiClient.GET(
        "/api/restaurants/{restaurantId}/menu",
        {
          params: { path: { restaurantId: id.value } },
        },
      );
      if (error) throw error;
      return data;
    },
    enabled: computed(() => !!id.value),
  });
}
