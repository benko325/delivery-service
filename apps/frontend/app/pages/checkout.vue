<template>
  <div>
    <h1 class="mb-4">
      <i class="bi bi-credit-card me-2"></i>
      Checkout
    </h1>

    <!-- Empty Cart Redirect -->
    <div v-if="cartStore.items.length === 0" class="alert alert-warning">
      <i class="bi bi-exclamation-triangle me-2"></i>
      Your cart is empty. Please add items before checkout.
      <NuxtLink to="/" class="alert-link ms-2">Browse Restaurants</NuxtLink>
    </div>

    <!-- Checkout Form -->
    <div v-else class="row">
      <!-- Order Summary -->
      <div class="col-lg-4 order-lg-2 mb-4">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Order Summary</h5>
          </div>
          <div class="card-body">
            <div
              v-for="item in cartStore.items"
              :key="item.menuItemId"
              class="d-flex justify-content-between mb-2"
            >
              <span>{{ item.name }} x{{ item.quantity }}</span>
              <span>{{
                formatPrice(item.price * item.quantity, item.currency)
              }}</span>
            </div>
            <hr />
            <div class="d-flex justify-content-between">
              <strong>Total:</strong>
              <strong class="text-primary">
                {{ formatPrice(cartStore.total, cartStore.currency || "EUR") }}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Delivery & Payment Form -->
      <div class="col-lg-8 order-lg-1">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-4">Delivery Information</h5>

            <form @submit.prevent="handleSubmit">
              <!-- Delivery Address (Simplified) -->
              <div class="mb-3">
                <label for="address" class="form-label">Delivery Address</label>
                <textarea
                  id="address"
                  v-model="deliveryAddress"
                  class="form-control"
                  rows="3"
                  required
                  placeholder="Enter your delivery address"
                ></textarea>
                <div class="form-text">
                  Note: In production, this would use saved addresses from your
                  profile.
                </div>
              </div>

              <!-- Payment Method -->
              <div class="mb-3">
                <label for="paymentMethod" class="form-label"
                  >Payment Method</label
                >
                <select
                  id="paymentMethod"
                  v-model="paymentMethod"
                  class="form-select"
                  required
                >
                  <option value="">Select payment method</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="cash">Cash on Delivery</option>
                </select>
              </div>

              <!-- Error Message -->
              <div
                v-if="createOrderMutation.isError.value"
                class="alert alert-danger"
              >
                <i class="bi bi-exclamation-triangle me-2"></i>
                Failed to create order. Please try again.
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                class="btn btn-primary btn-lg w-100"
                :disabled="createOrderMutation.isPending.value"
              >
                <span v-if="createOrderMutation.isPending.value">
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  Placing Order...
                </span>
                <span v-else>
                  <i class="bi bi-check-circle me-2"></i>
                  Place Order
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from "~/stores/cart";
import { useAuthStore } from "~/stores/auth";
import { useCreateOrder } from "~/composables/useOrders";

// Protect this page with auth middleware
definePageMeta({
  middleware: "auth",
});

const cartStore = useCartStore();
const authStore = useAuthStore();
const router = useRouter();

const deliveryAddress = ref("");
const paymentMethod = ref("");
const createOrderMutation = useCreateOrder();

/**
 * @brief Format price with currency
 */
const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "EUR",
  }).format(price);
};

/**
 * @brief Handle order submission
 */
const handleSubmit = () => {
  // Note: This is simplified. In production, you'd need to:
  // 1. Create/select a delivery address first
  // 2. Use the actual address ID
  // For demo purposes, we'll show an alert

  alert(
    "Order creation requires a delivery address ID from your customer profile. This would be implemented with proper customer address management.",
  );

  // Example of what the actual implementation would look like:
  // createOrderMutation.mutate({
  //   restaurantId: cartStore.restaurantId!,
  //   deliveryAddressId: 'address-uuid-here',
  //   items: cartStore.items.map(item => ({
  //     menuItemId: item.menuItemId,
  //     quantity: item.quantity,
  //   })),
  // });
};
</script>
