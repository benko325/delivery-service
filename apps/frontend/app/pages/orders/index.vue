<template>
  <div>
    <h1 class="mb-4">
      <i class="bi bi-receipt me-2"></i>
      My Orders
    </h1>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger">
      <i class="bi bi-exclamation-triangle me-2"></i>
      Failed to load orders: {{ error.message }}
    </div>

    <!-- Orders List -->
    <div v-else-if="orders && orders.length > 0">
      <div v-for="order in orders" :key="order.id" class="card mb-3">
        <div class="card-body">
          <div class="row">
            <!-- Order Info -->
            <div class="col-md-6 mb-3 mb-md-0">
              <h5 class="card-title mb-2">
                Order #{{ order.id.substring(0, 8) }}
                <span :class="getStatusBadgeClass(order.status)" class="ms-2">
                  {{ formatStatus(order.status) }}
                </span>
              </h5>
              
              <p class="card-text text-muted small mb-2">
                <i class="bi bi-calendar me-1"></i>
                {{ formatDate(order.createdAt) }}
              </p>

              <!-- Order Items Summary -->
              <div class="mb-2">
                <p class="mb-1 small text-muted">
                  <strong>Items ({{ getTotalItems(order.items) }}):</strong>
                </p>
                <ul class="list-unstyled small mb-0">
                  <li v-for="item in order.items.slice(0, 3)" :key="item.menuItemId">
                    {{ item.quantity }}x {{ item.name }}
                  </li>
                  <li v-if="order.items.length > 3" class="text-muted">
                    +{{ order.items.length - 3 }} more item(s)
                  </li>
                </ul>
              </div>

              <!-- Delivery Address -->
              <p class="card-text small text-muted mb-1">
                <i class="bi bi-geo-alt me-1"></i>
                <strong>Delivery to:</strong> {{ order.deliveryAddress.street }}, {{ order.deliveryAddress.city }}
              </p>

              <!-- Estimated Delivery Time -->
              <p v-if="order.estimatedDeliveryTime" class="card-text small text-muted mb-1">
                <i class="bi bi-clock me-1"></i>
                <strong>Estimated:</strong> {{ formatDate(order.estimatedDeliveryTime) }}
              </p>

              <!-- Actual Delivery Time -->
              <p v-if="order.actualDeliveryTime" class="card-text small text-success mb-1">
                <i class="bi bi-check-circle me-1"></i>
                <strong>Delivered:</strong> {{ formatDate(order.actualDeliveryTime) }}
              </p>

              <!-- Cancellation Info -->
              <p v-if="order.cancelledAt" class="card-text small text-danger mb-1">
                <i class="bi bi-x-circle me-1"></i>
                <strong>Cancelled:</strong> {{ formatDate(order.cancelledAt) }}
                <span v-if="order.cancellationReason">
                  <br />
                  <em>Reason: {{ order.cancellationReason }}</em>
                </span>
              </p>
            </div>

            <!-- Pricing & Actions -->
            <div class="col-md-6">
              <div class="d-flex flex-column h-100 justify-content-between">
                <!-- Price Breakdown -->
                <div class="mb-3">
                  <div class="d-flex justify-content-between mb-1">
                    <span class="small">Subtotal:</span>
                    <span class="small">{{ formatPrice(order.totalAmount - order.deliveryFee, order.currency) }}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-1">
                    <span class="small">Delivery Fee:</span>
                    <span class="small">{{ formatPrice(order.deliveryFee, order.currency) }}</span>
                  </div>
                  <hr class="my-2" />
                  <div class="d-flex justify-content-between">
                    <strong>Total:</strong>
                    <strong class="text-primary">
                      {{ formatPrice(order.totalAmount, order.currency) }}
                    </strong>
                  </div>
                </div>

                <!-- Action Button -->
                <div class="text-md-end">
                  <NuxtLink
                    :to="`/orders/${order.id}`"
                    class="btn btn-outline-primary"
                  >
                    <i class="bi bi-eye me-2"></i>
                    View Details
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center text-muted my-5">
      <i class="bi bi-receipt" style="font-size: 3rem"></i>
      <p class="mt-3">You haven't placed any orders yet</p>
      <NuxtLink to="/" class="btn btn-primary"> Browse Restaurants </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrders } from "~/composables/useOrders";

const { data: orders, isLoading, error } = useOrders();

/**
 * @brief Format date
 */
const formatDate = (date: string | Date) => {
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
 * @brief Get total number of items in order
 * @param items Order items
 * @return Total quantity
 */
const getTotalItems = (items: any[]) => {
  return items.reduce((total, item) => total + item.quantity, 0);
};

/**
 * @brief Get status badge CSS class
 */
const getStatusBadgeClass = (status: string) => {
  const baseClass = "badge";
  const statusMap: Record<string, string> = {
    pending: "bg-warning text-dark",
    payment_succeeded: "bg-info text-dark",
    confirmed: "bg-primary",
    preparing: "bg-info",
    ready_for_pickup: "bg-success",
    in_transit: "bg-primary",
    delivered: "bg-success",
    cancelled: "bg-danger",
  };
  return `${baseClass} ${statusMap[status] || "bg-secondary"}`;
};
</script>
