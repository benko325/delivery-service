<template>
  <div>
    <!-- Back Button -->
    <NuxtLink to="/" class="btn btn-outline-secondary mb-3">
      <i class="bi bi-arrow-left me-2"></i>
      Back to Restaurants
    </NuxtLink>

    <!-- Loading State -->
    <div v-if="isLoadingRestaurant || isLoadingMenu" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="restaurantError || menuError" class="alert alert-danger">
      <i class="bi bi-exclamation-triangle me-2"></i>
      Failed to load restaurant details
    </div>

    <!-- Restaurant Details & Menu -->
    <div v-else-if="restaurant">
      <!-- Restaurant Header -->
      <div class="card mb-4">
        <div class="card-body">
          <h1 class="card-title">{{ restaurant.name }}</h1>
          <p class="card-text text-muted">
            <i class="bi bi-geo-alt me-1"></i>
            {{ restaurant.address.street }}, {{ restaurant.address.city }}
            <span v-if="restaurant.address.state">, {{ restaurant.address.state }}</span>
            {{ restaurant.address.postalCode }}
          </p>
          <p class="card-text small text-muted mb-2">
            <i class="bi bi-telephone me-1"></i>
            {{ restaurant.phone }}
          </p>
          <p class="card-text small text-muted mb-2">
            <i class="bi bi-envelope me-1"></i>
            {{ restaurant.email }}
          </p>
          <p class="mb-0">
            <span v-if="restaurant.isActive" class="badge bg-success">Active</span>
            <span v-else class="badge bg-secondary">Inactive</span>
          </p>
          <p v-if="restaurant.description" class="mt-3">
            {{ restaurant.description }}
          </p>
        </div>
      </div>

      <!-- Menu Items -->
      <h2 class="mb-3">
        <i class="bi bi-book me-2"></i>
        Menu
      </h2>

      <div v-if="menuItems && menuItems.length > 0" class="row g-4">
        <div v-for="item in menuItems" :key="item.id" class="col-md-6 col-lg-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">{{ item.name }}</h5>
              <p v-if="item.description" class="card-text text-muted small">
                {{ item.description }}
              </p>
              <p class="card-text">
                <strong class="text-primary">
                  {{ formatPrice(item.price, item.currency) }}
                </strong>
              </p>
              <button
                v-if="item.isAvailable"
                class="btn btn-sm btn-outline-primary"
                @click="addToCart(item)"
              >
                <i class="bi bi-cart-plus me-1"></i>
                Add to Cart
              </button>
              <span v-else class="badge bg-secondary">Unavailable</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty Menu -->
      <div v-else class="text-center text-muted my-5">
        <i class="bi bi-book" style="font-size: 3rem"></i>
        <p class="mt-3">No menu items available</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRestaurant, useMenuItems } from "~/composables/useRestaurants";
import { useCartStore } from "~/stores/cart";

const route = useRoute();
const cartStore = useCartStore();
const restaurantId = computed(() => route.params.id as string);

const {
  data: restaurant,
  isLoading: isLoadingRestaurant,
  error: restaurantError,
} = useRestaurant(restaurantId);

const {
  data: menuItems,
  isLoading: isLoadingMenu,
  error: menuError,
} = useMenuItems(restaurantId);

/**
 * @brief Format price with currency
 * @param price Price amount
 * @param currency Currency code
 * @return Formatted price string
 */
const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "EUR",
  }).format(price);
};

/**
 * @brief Add menu item to cart
 * @param item Menu item to add
 */
const addToCart = (item: any) => {
  cartStore.addItem({
    menuItemId: item.id,
    restaurantId: restaurantId.value,
    name: item.name,
    price: item.price,
    currency: item.currency,
    quantity: 1,
  });
};
</script>
