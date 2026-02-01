<template>
  <div>
    <h1 class="mb-4">
      <i class="bi bi-truck me-2"></i>
      My Deliveries
    </h1>

    <!-- Tab Navigation -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: activeTab === 'my-deliveries' }"
          @click="activeTab = 'my-deliveries'"
        >
          <i class="bi bi-box-seam me-1"></i>
          My Deliveries
          <span v-if="myDeliveries && myDeliveries.length > 0" class="badge bg-primary ms-2">
            {{ myDeliveries.length }}
          </span>
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: activeTab === 'available' }"
          @click="activeTab = 'available'"
        >
          <i class="bi bi-search me-1"></i>
          Available Orders
          <span v-if="availableOrders && availableOrders.length > 0" class="badge bg-success ms-2">
            {{ availableOrders.length }}
          </span>
        </button>
      </li>
    </ul>

    <!-- My Deliveries Tab -->
    <div v-if="activeTab === 'my-deliveries'">
      <!-- Loading State -->
      <div v-if="isLoadingDeliveries" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="deliveriesError" class="alert alert-danger">
        <i class="bi bi-exclamation-triangle me-2"></i>
        Failed to load deliveries: {{ deliveriesError.message }}
      </div>

      <!-- Deliveries List -->
      <div v-else-if="myDeliveries && myDeliveries.length > 0" class="row g-3">
        <div v-for="order in myDeliveries" :key="order.id" class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="row">
                <!-- Order Info -->
                <div class="col-md-7">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="card-title mb-0">
                      Order #{{ order.id.substring(0, 8) }}
                    </h5>
                    <span :class="getStatusBadgeClass(order.status)">
                      {{ formatStatus(order.status) }}
                    </span>
                  </div>

                  <p class="text-muted small mb-2">
                    <i class="bi bi-clock me-1"></i>
                    {{ formatDate(order.createdAt) }}
                  </p>

                  <!-- Delivery Address -->
                  <div class="mb-2">
                    <p class="mb-1 small">
                      <strong><i class="bi bi-geo-alt me-1"></i>Delivery Address:</strong>
                    </p>
                    <p class="mb-0 small text-muted">
                      {{ order.deliveryAddress.street }}<br />
                      {{ order.deliveryAddress.city }}, {{ order.deliveryAddress.postalCode }}
                    </p>
                  </div>

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

                  <!-- Estimated Delivery -->
                  <p v-if="order.estimatedDeliveryTime" class="card-text small text-muted mb-0">
                    <i class="bi bi-alarm me-1"></i>
                    <strong>Est. Delivery:</strong> {{ formatDate(order.estimatedDeliveryTime) }}
                  </p>
                </div>

                <!-- Actions & Price -->
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
                      <div class="d-flex justify-content-between text-muted small">
                        <span>Delivery Fee:</span>
                        <span>{{ formatPrice(order.deliveryFee, order.currency) }}</span>
                      </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="d-flex flex-column gap-2">
                      <NuxtLink
                        :to="`/driver/deliveries/${order.id}`"
                        class="btn btn-primary btn-sm"
                      >
                        <i class="bi bi-eye me-2"></i>
                        View Details
                      </NuxtLink>

                      <!-- Quick Actions based on status -->
                      <button
                        v-if="order.status === 'ready_for_pickup'"
                        class="btn btn-success btn-sm"
                        @click="handlePickup(order.id)"
                        :disabled="updateStatusMutation.isPending.value"
                      >
                        <i class="bi bi-box-arrow-up me-2"></i>
                        Mark as Picked Up
                      </button>

                      <button
                        v-if="order.status === 'in_transit'"
                        class="btn btn-success btn-sm"
                        @click="handleDeliver(order.id)"
                        :disabled="updateStatusMutation.isPending.value"
                      >
                        <i class="bi bi-check-circle me-2"></i>
                        Mark as Delivered
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center text-muted my-5">
        <i class="bi bi-box-seam" style="font-size: 3rem"></i>
        <p class="mt-3">No active deliveries</p>
        <p class="small">Check the Available Orders tab to pick up new orders</p>
      </div>
    </div>

    <!-- Available Orders Tab -->
    <div v-if="activeTab === 'available'">
      <!-- Loading State -->
      <div v-if="isLoadingAvailable" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="availableError" class="alert alert-danger">
        <i class="bi bi-exclamation-triangle me-2"></i>
        Failed to load available orders: {{ availableError.message }}
      </div>

      <!-- Available Orders List -->
      <div v-else-if="availableOrders && availableOrders.length > 0" class="row g-3">
        <div v-for="order in availableOrders" :key="order.id" class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="row">
                <!-- Order Info -->
                <div class="col-md-7">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="card-title mb-0">
                      Order #{{ order.id.substring(0, 8) }}
                    </h5>
                    <span class="badge bg-success">Available</span>
                  </div>

                  <p class="text-muted small mb-2">
                    <i class="bi bi-clock me-1"></i>
                    {{ formatDate(order.createdAt) }}
                  </p>

                  <!-- Delivery Address -->
                  <div class="mb-2">
                    <p class="mb-1 small">
                      <strong><i class="bi bi-geo-alt me-1"></i>Delivery Address:</strong>
                    </p>
                    <p class="mb-0 small text-muted">
                      {{ order.deliveryAddress.street }}<br />
                      {{ order.deliveryAddress.city }}, {{ order.deliveryAddress.postalCode }}
                    </p>
                  </div>

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
                </div>

                <!-- Actions & Price -->
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
                      <div class="d-flex justify-content-between text-success small">
                        <span>Your Earnings:</span>
                        <span>{{ formatPrice(order.deliveryFee, order.currency) }}</span>
                      </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="d-flex flex-column gap-2">
                      <button
                        class="btn btn-success btn-sm"
                        @click="showAcceptModal(order.id)"
                        :disabled="acceptMutation.isPending.value"
                      >
                        <i class="bi bi-hand-thumbs-up me-2"></i>
                        Accept Order
                      </button>

                      <NuxtLink
                        :to="`/driver/deliveries/${order.id}`"
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
      </div>

      <!-- Empty State -->
      <div v-else class="text-center text-muted my-5">
        <i class="bi bi-inbox" style="font-size: 3rem"></i>
        <p class="mt-3">No available orders at the moment</p>
        <p class="small">New orders will appear here when restaurants confirm them</p>
      </div>
    </div>

    <!-- Accept Order Modal -->
    <div
      v-if="acceptModalOrderId"
      class="modal show d-block"
      tabindex="-1"
      style="background-color: rgba(0,0,0,0.5)"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Accept Order</h5>
            <button
              type="button"
              class="btn-close"
              @click="acceptModalOrderId = null"
            ></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="estimatedMinutes" class="form-label">
                Estimated Delivery Time (minutes)
              </label>
              <input
                id="estimatedMinutes"
                v-model.number="estimatedMinutes"
                type="number"
                min="5"
                max="120"
                class="form-control"
              />
              <div class="form-text">
                How long will it take you to pick up and deliver this order?
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="acceptModalOrderId = null"
              :disabled="acceptMutation.isPending.value"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-success"
              @click="handleAcceptOrder"
              :disabled="acceptMutation.isPending.value"
            >
              <span v-if="acceptMutation.isPending.value">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Accepting...
              </span>
              <span v-else>
                <i class="bi bi-check-circle me-2"></i>
                Accept Order
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  useAvailableOrders,
  useMyDeliveries,
  useAcceptOrder,
  useUpdateDeliveryStatus,
} from "~/composables/useDriverOrders";

definePageMeta({
  middleware: ["driver"],
});

const activeTab = ref<"my-deliveries" | "available">("my-deliveries");
const acceptModalOrderId = ref<string | null>(null);
const estimatedMinutes = ref(30);

// Fetch data
const {
  data: myDeliveries,
  isLoading: isLoadingDeliveries,
  error: deliveriesError,
} = useMyDeliveries();

const {
  data: availableOrders,
  isLoading: isLoadingAvailable,
  error: availableError,
} = useAvailableOrders();

// Mutations
const acceptMutation = useAcceptOrder();
const updateStatusMutation = useUpdateDeliveryStatus();

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
    ready_for_pickup: "bg-warning text-dark",
    in_transit: "bg-info",
    delivered: "bg-success",
    cancelled: "bg-danger",
  };
  return `${baseClass} ${statusMap[status] || "bg-secondary"}`;
};

/**
 * @brief Show accept modal
 */
const showAcceptModal = (orderId: string) => {
  acceptModalOrderId.value = orderId;
  estimatedMinutes.value = 30;
};

/**
 * @brief Handle accept order
 */
const handleAcceptOrder = () => {
  if (!acceptModalOrderId.value) return;

  acceptMutation.mutate(
    {
      orderId: acceptModalOrderId.value,
      estimatedMinutes: estimatedMinutes.value,
    },
    {
      onSuccess: () => {
        acceptModalOrderId.value = null;
        activeTab.value = "my-deliveries";
      },
    }
  );
};

/**
 * @brief Handle pickup (mark as in_transit)
 */
const handlePickup = (orderId: string) => {
  updateStatusMutation.mutate({
    orderId,
    status: "in_transit",
  });
};

/**
 * @brief Handle deliver (mark as delivered)
 */
const handleDeliver = (orderId: string) => {
  updateStatusMutation.mutate({
    orderId,
    status: "delivered",
  });
};
</script>
