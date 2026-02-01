<template>
  <div>
    <h1 class="mb-4">
      <i class="bi bi-shop me-2"></i>
      Restaurant Orders
    </h1>

    <!-- Restaurant Selector (if user owns multiple restaurants) -->
    <div class="card mb-4">
      <div class="card-body">
        <div v-if="isLoadingRestaurants" class="text-center">
          <div class="spinner-border spinner-border-sm text-primary" role="status">
            <span class="visually-hidden">Loading restaurants...</span>
          </div>
        </div>
        <div v-else-if="!myRestaurants || myRestaurants.length === 0" class="alert alert-warning mb-0">
          <i class="bi bi-exclamation-triangle me-2"></i>
          You don't own any restaurants. Please contact an administrator.
        </div>
        <div v-else class="row align-items-center">
          <div class="col-md-6">
            <label for="restaurantSelect" class="form-label">
              <strong>Select Restaurant:</strong>
            </label>
            <select
              id="restaurantSelect"
              v-model="selectedRestaurantId"
              class="form-select"
            >
              <option value="">-- Select a restaurant --</option>
              <option
                v-for="restaurant in myRestaurants"
                :key="restaurant.id"
                :value="restaurant.id"
              >
                {{ restaurant.name }}
              </option>
            </select>
          </div>
          <div class="col-md-6">
            <div class="d-flex gap-2 flex-wrap mt-3 mt-md-0">
              <button
                class="btn btn-sm"
                :class="statusFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'"
                @click="statusFilter = 'all'"
              >
                All Orders
              </button>
              <button
                class="btn btn-sm"
                :class="statusFilter === 'pending' ? 'btn-warning' : 'btn-outline-warning'"
                @click="statusFilter = 'pending'"
              >
                Pending
              </button>
              <button
                class="btn btn-sm"
                :class="statusFilter === 'confirmed' ? 'btn-info' : 'btn-outline-info'"
                @click="statusFilter = 'confirmed'"
              >
                Confirmed
              </button>
              <button
                class="btn btn-sm"
                :class="statusFilter === 'preparing' ? 'btn-success' : 'btn-outline-success'"
                @click="statusFilter = 'preparing'"
              >
                Preparing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

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

    <!-- No Restaurant Selected -->
    <div v-else-if="!selectedRestaurantId" class="alert alert-info">
      <i class="bi bi-info-circle me-2"></i>
      Please select a restaurant to view orders
    </div>

    <!-- Orders List -->
    <div v-else-if="filteredOrders && filteredOrders.length > 0">
      <div v-for="order in filteredOrders" :key="order.id" class="card mb-3">
        <div class="card-body">
          <div class="row">
            <!-- Order Info -->
            <div class="col-md-7 mb-3 mb-md-0">
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
                <p class="mb-1 small">
                  <strong>Items ({{ getTotalItems(order.items) }}):</strong>
                </p>
                <ul class="list-unstyled small mb-0">
                  <li v-for="item in order.items.slice(0, 2)" :key="item.menuItemId">
                    {{ item.quantity }}x {{ item.name }}
                  </li>
                  <li v-if="order.items.length > 2" class="text-muted">
                    +{{ order.items.length - 2 }} more item(s)
                  </li>
                </ul>
              </div>

              <!-- Delivery Address -->
              <p class="card-text small text-muted mb-1">
                <i class="bi bi-geo-alt me-1"></i>
                <strong>Delivery:</strong> {{ order.deliveryAddress.street }}, {{ order.deliveryAddress.city }}
              </p>

              <!-- Estimated Time -->
              <p v-if="order.estimatedDeliveryTime" class="card-text small text-muted mb-0">
                <i class="bi bi-clock me-1"></i>
                <strong>Est. Delivery:</strong> {{ formatDate(order.estimatedDeliveryTime) }}
              </p>
            </div>

            <!-- Pricing & Actions -->
            <div class="col-md-5">
              <div class="d-flex flex-column h-100 justify-content-between">
                <!-- Price -->
                <div class="mb-3">
                  <div class="d-flex justify-content-between">
                    <strong>Total:</strong>
                    <strong class="text-primary">
                      {{ formatPrice(order.totalAmount, order.currency) }}
                    </strong>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="d-flex flex-column gap-2">
                  <NuxtLink
                    :to="`/restaurant/orders/${order.id}`"
                    class="btn btn-outline-primary btn-sm"
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
      <p class="mt-3">No orders found</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRestaurantOrders } from "~/composables/useRestaurantOrders";
import { useMyRestaurants } from "~/composables/useRestaurants";

definePageMeta({
  middleware: ["restaurant-owner"],
});

// Load user's restaurants
const { data: myRestaurants, isLoading: isLoadingRestaurants } = useMyRestaurants();

// Auto-select first restaurant when loaded
const selectedRestaurantId = ref("");
watch(myRestaurants, (restaurants) => {
  if (restaurants && restaurants.length > 0 && !selectedRestaurantId.value) {
    selectedRestaurantId.value = restaurants[0]?.id ?? "";
  }
});

const statusFilter = ref<"all" | string>("all");

const { data: orders, isLoading, error } = useRestaurantOrders(selectedRestaurantId);

// Filter orders by status
const filteredOrders = computed(() => {
  if (!orders.value) return [];
  if (statusFilter.value === "all") return orders.value;
  return orders.value.filter((order: any) => order.status === statusFilter.value);
});

/**
 * @brief Format date
 */
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
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
