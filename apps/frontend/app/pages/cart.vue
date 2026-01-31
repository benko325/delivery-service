<template>
  <div>
    <h1 class="mb-4">
      <i class="bi bi-cart3 me-2"></i>
      Shopping Cart
    </h1>

    <!-- Empty Cart -->
    <div
      v-if="cartStore.items.length === 0"
      class="text-center text-muted my-5"
    >
      <i class="bi bi-cart-x" style="font-size: 3rem"></i>
      <p class="mt-3">Your cart is empty</p>
      <NuxtLink to="/" class="btn btn-primary"> Browse Restaurants </NuxtLink>
    </div>

    <!-- Cart Items -->
    <div v-else>
      <div class="card mb-4">
        <div class="card-body">
          <div
            v-for="item in cartStore.items"
            :key="item.menuItemId"
            class="d-flex align-items-center justify-content-between border-bottom py-3"
          >
            <div class="flex-grow-1">
              <h6 class="mb-1">{{ item.name }}</h6>
              <p class="text-muted small mb-0">
                {{ formatPrice(item.price, item.currency) }} each
              </p>
            </div>

            <div class="d-flex align-items-center gap-3">
              <!-- Quantity Controls -->
              <div class="btn-group" role="group">
                <button
                  class="btn btn-sm btn-outline-secondary"
                  @click="
                    cartStore.updateQuantity(item.menuItemId, item.quantity - 1)
                  "
                >
                  <i class="bi bi-dash"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary" disabled>
                  {{ item.quantity }}
                </button>
                <button
                  class="btn btn-sm btn-outline-secondary"
                  @click="
                    cartStore.updateQuantity(item.menuItemId, item.quantity + 1)
                  "
                >
                  <i class="bi bi-plus"></i>
                </button>
              </div>

              <!-- Item Total -->
              <div class="text-end" style="min-width: 100px">
                <strong>{{
                  formatPrice(item.price * item.quantity, item.currency)
                }}</strong>
              </div>

              <!-- Remove Button -->
              <button
                class="btn btn-sm btn-outline-danger"
                @click="cartStore.removeItem(item.menuItemId)"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>

          <!-- Total -->
          <div class="d-flex justify-content-between align-items-center pt-3">
            <h5 class="mb-0">Total:</h5>
            <h4 class="mb-0 text-primary">
              {{ formatPrice(cartStore.total, cartStore.currency || "EUR") }}
            </h4>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="d-flex gap-2">
        <button class="btn btn-outline-danger" @click="handleClearCart">
          <i class="bi bi-trash me-2"></i>
          Clear Cart
        </button>
        <NuxtLink to="/checkout" class="btn btn-primary ms-auto">
          Proceed to Checkout
          <i class="bi bi-arrow-right ms-2"></i>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from "~/stores/cart";

// Protect this page with auth middleware
definePageMeta({
  middleware: "auth",
});

const cartStore = useCartStore();

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
 * @brief Handle clear cart action
 */
const handleClearCart = () => {
  if (confirm("Are you sure you want to clear your cart?")) {
    cartStore.clear();
  }
};
</script>
