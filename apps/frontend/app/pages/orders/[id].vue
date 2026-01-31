<template>
  <div>
    <!-- Back Button -->
    <NuxtLink to="/orders" class="btn btn-outline-secondary mb-3">
      <i class="bi bi-arrow-left me-2"></i>
      Back to Orders
    </NuxtLink>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger">
      <i class="bi bi-exclamation-triangle me-2"></i>
      Failed to load order details
    </div>

    <!-- Order Details -->
    <div v-else-if="order">
      <div class="row">
        <!-- Order Info -->
        <div class="col-lg-8">
          <div class="card mb-4">
            <div class="card-header bg-primary text-white">
              <h4 class="mb-0">Order #{{ order.id.substring(0, 8) }}</h4>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-sm-6">
                  <strong>Status:</strong>
                  <div class="mt-1">
                    <span :class="getStatusBadgeClass(order.status)">
                      {{ formatStatus(order.status) }}
                    </span>
                  </div>
                </div>
                <div class="col-sm-6">
                  <strong>Order Date:</strong>
                  <div class="mt-1">{{ formatDate(order.createdAt) }}</div>
                </div>
              </div>

              <hr />

              <h5 class="mb-3">Order Items</h5>
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in order.items" :key="item.id">
                      <td>{{ item.menuItemName }}</td>
                      <td>{{ item.quantity }}</td>
                      <td>{{ formatPrice(item.price, order.currency) }}</td>
                      <td>
                        {{
                          formatPrice(
                            item.price * item.quantity,
                            order.currency,
                          )
                        }}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colspan="3" class="text-end">Total:</th>
                      <th class="text-primary">
                        {{ formatPrice(order.totalPrice, order.currency) }}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="order.status === 'pending'" class="card">
            <div class="card-body">
              <h5 class="card-title">Actions</h5>
              <div class="d-flex gap-2">
                <button
                  class="btn btn-primary"
                  @click="handlePayOrder"
                  :disabled="payMutation.isPending.value"
                >
                  <span v-if="payMutation.isPending.value">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Processing...
                  </span>
                  <span v-else>
                    <i class="bi bi-credit-card me-2"></i>
                    Pay for Order
                  </span>
                </button>
                <button
                  class="btn btn-outline-danger"
                  @click="handleCancelOrder"
                  :disabled="cancelMutation.isPending.value"
                >
                  <i class="bi bi-x-circle me-2"></i>
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Delivery Info -->
        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Delivery Information</h5>
            </div>
            <div class="card-body">
              <p v-if="order.deliveryAddress">
                <strong>Address:</strong><br />
                {{ order.deliveryAddress }}
              </p>
              <p v-if="order.estimatedDeliveryTime">
                <strong>Estimated Delivery:</strong><br />
                {{ formatDate(order.estimatedDeliveryTime) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  useOrder,
  usePayForOrder,
  useCancelOrder,
} from "~/composables/useOrders";

// Protect this page with auth middleware
definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const orderId = computed(() => route.params.id as string);

const { data: order, isLoading, error } = useOrder(orderId);
const payMutation = usePayForOrder();
const cancelMutation = useCancelOrder();

/**
 * @brief Format date
 */
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * @brief Format price
 */
const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "EUR",
  }).format(price);
};

/**
 * @brief Format order status
 */
const formatStatus = (status: string) => {
  return status.replace(/_/g, " ").toUpperCase();
};

/**
 * @brief Get status badge CSS class
 */
const getStatusBadgeClass = (status: string) => {
  const baseClass = "badge";
  const statusMap: Record<string, string> = {
    pending: "bg-warning",
    payment_succeeded: "bg-info",
    confirmed: "bg-primary",
    preparing: "bg-info",
    ready_for_pickup: "bg-success",
    in_transit: "bg-primary",
    delivered: "bg-success",
    cancelled: "bg-danger",
  };
  return `${baseClass} ${statusMap[status] || "bg-secondary"}`;
};

/**
 * @brief Handle pay for order
 */
const handlePayOrder = () => {
  payMutation.mutate({
    orderId: orderId.value,
    paymentMethod: "credit_card", // Simplified for demo
  });
};

/**
 * @brief Handle cancel order
 */
const handleCancelOrder = () => {
  if (confirm("Are you sure you want to cancel this order?")) {
    cancelMutation.mutate(orderId.value);
  }
};
</script>
