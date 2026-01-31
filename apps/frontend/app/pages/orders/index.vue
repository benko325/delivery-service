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
          <div class="row align-items-center">
            <div class="col-md-8">
              <h5 class="card-title">Order #{{ order.id.substring(0, 8) }}</h5>
              <p class="card-text text-muted mb-2">
                <i class="bi bi-calendar me-1"></i>
                {{ formatDate(order.createdAt) }}
              </p>
              <p class="card-text">
                <span :class="getStatusBadgeClass(order.status)">
                  {{ formatStatus(order.status) }}
                </span>
              </p>
              <p class="card-text">
                <strong class="text-primary">
                  {{ formatPrice(order.totalPrice, order.currency) }}
                </strong>
              </p>
            </div>
            <div class="col-md-4 text-md-end">
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

// Protect this page with auth middleware
definePageMeta({
  middleware: "auth",
});

const { data: orders, isLoading, error } = useOrders();

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
</script>
