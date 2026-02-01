<template>
  <div>
    <h1 class="mb-4">
      <i class="bi bi-credit-card me-2"></i>
      Checkout
    </h1>

    <!-- Empty Cart Redirect -->
    <div v-if="!cartStore.isLoading && cartStore.items.length === 0" class="alert alert-warning">
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
            <div class="d-flex justify-content-between mb-2">
              <span>Subtotal:</span>
              <span>{{ formatPrice(cartStore.total, cartStore.currency || "EUR") }}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span>Delivery Fee:</span>
              <span>{{ formatPrice(deliveryFee, cartStore.currency || "EUR") }}</span>
            </div>
            <hr />
            <div class="d-flex justify-content-between">
              <strong>Total:</strong>
              <strong class="text-primary">
                {{ formatPrice(cartStore.total + deliveryFee, cartStore.currency || "EUR") }}
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
              <!-- Street -->
              <div class="mb-3">
                <label for="street" class="form-label">Street Address *</label>
                <input
                  id="street"
                  v-model="form.street"
                  type="text"
                  class="form-control"
                  required
                  placeholder="123 Main Street"
                />
              </div>

              <!-- City -->
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="city" class="form-label">City *</label>
                  <input
                    id="city"
                    v-model="form.city"
                    type="text"
                    class="form-control"
                    required
                    placeholder="Brno"
                  />
                </div>
                <div class="col-md-6">
                  <label for="postalCode" class="form-label">Postal Code *</label>
                  <input
                    id="postalCode"
                    v-model="form.postalCode"
                    type="text"
                    class="form-control"
                    required
                    placeholder="602 00"
                  />
                </div>
              </div>

              <!-- Country -->
              <div class="mb-3">
                <label for="country" class="form-label">Country *</label>
                <input
                  id="country"
                  v-model="form.country"
                  type="text"
                  class="form-control"
                  required
                  placeholder="Czech Republic"
                />
              </div>

              <!-- Optional GPS Coordinates -->
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="latitude" class="form-label">Latitude (Optional)</label>
                  <input
                    id="latitude"
                    v-model.number="form.latitude"
                    type="number"
                    step="any"
                    class="form-control"
                    placeholder="49.1951"
                  />
                </div>
                <div class="col-md-6">
                  <label for="longitude" class="form-label">Longitude (Optional)</label>
                  <input
                    id="longitude"
                    v-model.number="form.longitude"
                    type="number"
                    step="any"
                    class="form-control"
                    placeholder="16.6068"
                  />
                </div>
              </div>

              <!-- Delivery Instructions -->
              <div class="mb-3">
                <label for="instructions" class="form-label">Delivery Instructions (Optional)</label>
                <textarea
                  id="instructions"
                  v-model="form.instructions"
                  class="form-control"
                  rows="2"
                  placeholder="Ring the doorbell, apartment 2B"
                ></textarea>
              </div>

              <!-- Delivery Fee -->
              <div class="mb-3">
                <label for="deliveryFee" class="form-label">Delivery Fee</label>
                <div class="input-group">
                  <input
                    id="deliveryFee"
                    v-model.number="deliveryFee"
                    type="number"
                    step="0.01"
                    min="0"
                    class="form-control"
                  />
                  <span class="input-group-text">{{ cartStore.currency || 'EUR' }}</span>
                </div>
                <div class="form-text">
                  Adjust delivery fee if needed (default: 0)
                </div>
              </div>

              <!-- Error Message -->
              <div
                v-if="checkoutMutation.isError.value"
                class="alert alert-danger"
              >
                <i class="bi bi-exclamation-triangle me-2"></i>
                {{ checkoutMutation.error.value?.message || 'Failed to create order. Please try again.' }}
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                class="btn btn-primary btn-lg w-100"
                :disabled="checkoutMutation.isPending.value"
              >
                <span v-if="checkoutMutation.isPending.value">
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
import { useCheckoutCart } from "~/composables/useCart";

const cartStore = useCartStore();
const router = useRouter();
const checkoutMutation = useCheckoutCart();

// Form data
const form = ref({
  street: '',
  city: '',
  postalCode: '',
  country: '',
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
  instructions: '',
});

const deliveryFee = ref(0);

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
const handleSubmit = async () => {
  checkoutMutation.mutate(
    {
      deliveryAddress: {
        street: form.value.street,
        city: form.value.city,
        postalCode: form.value.postalCode,
        country: form.value.country,
        latitude: form.value.latitude,
        longitude: form.value.longitude,
        instructions: form.value.instructions || undefined,
      },
      deliveryFee: deliveryFee.value,
    },
    {
      onSuccess: (data) => {
        // Navigate to orders page after successful checkout
        router.push('/orders');
      },
    }
  );
};
</script>
