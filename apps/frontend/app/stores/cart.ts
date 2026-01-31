import { defineStore } from "pinia";
import {
  useCart,
  useAddToCart,
  useUpdateCartItemQuantity,
  useRemoveFromCart,
  useClearCart,
} from "~/composables/useCart";

/**
 * @file Shopping cart store
 * @description Manages cart items using backend API
 */

export interface CartItem {
  menuItemId: string;
  restaurantId: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
}

export const useCartStore = defineStore("cart", () => {
  // Use composables for API operations
  const { data: cartData, isLoading, refetch } = useCart();
  const addToCartMutation = useAddToCart();
  const updateQuantityMutation = useUpdateCartItemQuantity();
  const removeFromCartMutation = useRemoveFromCart();
  const clearCartMutation = useClearCart();

  // Computed getters
  const items = computed(() => cartData.value?.items ?? []);
  const restaurantId = computed(() => cartData.value?.restaurantId ?? null);

  const total = computed(() => {
    return items.value.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  });

  const itemCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  const currency = computed(() => {
    return items.value.length > 0 && items.value[0]
      ? items.value[0].currency
      : null;
  });

  /**
   * @brief Add item to cart via API
   * @param item Cart item to add
   * @description Validates restaurant and updates via backend
   */
  const addItem = async (item: CartItem) => {
    const currentRestaurantId = restaurantId.value;

    // Check if adding from different restaurant
    if (
      currentRestaurantId &&
      typeof currentRestaurantId === "string" &&
      currentRestaurantId !== item.restaurantId
    ) {
      if (
        confirm(
          "Adding items from a different restaurant will clear your current cart. Continue?",
        )
      ) {
        await clearCartMutation.mutateAsync();
      } else {
        return;
      }
    }

    await addToCartMutation.mutateAsync(item);
  };

  /**
   * @brief Update item quantity via API
   * @param menuItemId Menu item ID
   * @param quantity New quantity
   */
  const updateQuantity = async (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(menuItemId);
    } else {
      await updateQuantityMutation.mutateAsync({ menuItemId, quantity });
    }
  };

  /**
   * @brief Remove item from cart via API
   * @param menuItemId Menu item ID
   */
  const removeItem = async (menuItemId: string) => {
    await removeFromCartMutation.mutateAsync(menuItemId);
  };

  /**
   * @brief Clear entire cart via API
   */
  const clear = async () => {
    await clearCartMutation.mutateAsync();
  };

  /**
   * @brief Refresh cart data from API
   */
  const refresh = async () => {
    await refetch();
  };

  return {
    // Data
    items,
    restaurantId,
    isLoading,

    // Getters
    total,
    itemCount,
    currency,

    // Actions
    addItem,
    updateQuantity,
    removeItem,
    clear,
    refresh,
  };
});
