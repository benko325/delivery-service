<template>
  <div>
    <!-- Back Button -->
    <NuxtLink to="/restaurant/orders" class="btn btn-outline-secondary mb-3">
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
      Failed to load order details: {{ error.message }}
    </div>

    <!-- Order Details -->
    <div v-else-if="order">
      <div class="row">
        <!-- Order Info -->
        <div class="col-lg-8">
          <!-- Order Header -->
          <div class="card mb-4">
            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 class="mb-0">Order #{{ order.id.substring(0, 8) }}</h4>
              <span :class="getStatusBadgeClass(order.status)">
                {{ formatStatus(order.status) }}
              </span>
            </div>
            <div class="card-body">
              <!-- Order Metadata -->
              <div class="row mb-3">
                <div class="col-sm-6 mb-2">
                  <p class="mb-1 text-muted small">Order Date</p>
                  <p class="mb-0">
                    <i class="bi bi-calendar me-1"></i>
                    {{ formatDate(order.createdAt) }}
                  </p>
                </div>
                <div class="col-sm-6 mb-2">
                  <p class="mb-1 text-muted small">Last Updated</p>
                  <p class="mb-0">
                    <i class="bi bi-clock-history me-1"></i>
                    {{ formatDate(order.updatedAt) }}
                  </p>
                </div>
              </div>

              <hr />

              <!-- Order Items -->
              <h5 class="mb-3">
                <i class="bi bi-bag me-2"></i>
                Order Items ({{ getTotalItems(order.items) }})
              </h5>
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead class="table-light">
                    <tr>
                      <th>Item</th>
                      <th class="text-center">Quantity</th>
                      <th class="text-end">Price</th>
                      <th class="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in order.items" :key="item.menuItemId">
                      <td>{{ item.name }}</td>
                      <td class="text-center">{{ item.quantity }}</td>
                      <td class="text-end">{{ formatPrice(item.price, item.currency) }}</td>
                      <td class="text-end">
                        {{ formatPrice(item.price * item.quantity, item.currency) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Price Summary -->
              <div class="row justify-content-end">
                <div class="col-md-6">
                  <div class="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>{{ formatPrice(order.totalAmount - order.deliveryFee, order.currency) }}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span>Delivery Fee:</span>
                    <span>{{ formatPrice(order.deliveryFee, order.currency) }}</span>
                  </div>
                  <hr />
                  <div class="d-flex justify-content-between">
                    <strong class="h5 mb-0">Total:</strong>
                    <strong class="h5 mb-0 text-primary">
                      {{ formatPrice(order.totalAmount, order.currency) }}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Restaurant Actions -->
          <div v-if="canPerformActions(order.status)" class="card mb-4">
            <div class="card-body">
              <h5 class="card-title mb-3">
                <i class="bi bi-lightning me-2"></i>
                Order Actions
              </h5>

              <!-- Payment Succeeded - Confirm or Reject -->
              <div v-if="order.status === 'payment_succeeded'" class="alert alert-info mb-3">
                <i class="bi bi-info-circle me-2"></i>
                <strong>Action Required:</strong> Please confirm or reject this order.
              </div>

              <div class="d-flex gap-2 flex-wrap">
                <!-- Confirm Order -->
                <button
                  v-if="order.status === 'payment_succeeded'"
                  class="btn btn-success"
                  @click="showConfirmModal = true"
                  :disabled="confirmMutation.isPending.value"
                >
                  <i class="bi bi-check-circle me-2"></i>
                  Confirm Order
                </button>

                <!-- Reject Order -->
                <button
                  v-if="order.status === 'payment_succeeded'"
                  class="btn btn-outline-danger"
                  @click="handleRejectOrder"
                  :disabled="rejectMutation.isPending.value"
                >
                  <i class="bi bi-x-circle me-2"></i>
                  Reject Order
                </button>

                <!-- Mark as Preparing -->
                <button
                  v-if="order.status === 'confirmed'"
                  class="btn btn-primary"
                  @click="handleUpdateStatus('preparing')"
                  :disabled="updateStatusMutation.isPending.value"
                >
                  <span v-if="updateStatusMutation.isPending.value && pendingStatus === 'preparing'">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Updating...
                  </span>
                  <span v-else>
                    <i class="bi bi-hourglass-split me-2"></i>
                    Mark as Preparing
                  </span>
                </button>

                <!-- Mark as Ready for Pickup -->
                <button
                  v-if="order.status === 'preparing'"
                  class="btn btn-success"
                  @click="handleUpdateStatus('ready_for_pickup')"
                  :disabled="updateStatusMutation.isPending.value"
                >
                  <span v-if="updateStatusMutation.isPending.value && pendingStatus === 'ready_for_pickup'">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Updating...
                  </span>
                  <span v-else>
                    <i class="bi bi-bag-check me-2"></i>
                    Mark as Ready for Pickup
                  </span>
                </button>
              </div>

              <!-- Error Messages -->
              <div v-if="confirmMutation.isError.value" class="alert alert-danger mt-3 mb-0">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Failed to confirm order. Please try again.
              </div>
              <div v-if="rejectMutation.isError.value" class="alert alert-danger mt-3 mb-0">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Failed to reject order. Please try again.
              </div>
              <div v-if="updateStatusMutation.isError.value" class="alert alert-danger mt-3 mb-0">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Failed to update order status. Please try again.
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="col-lg-4">
          <!-- Delivery Information -->
          <div class="card mb-3">
            <div class="card-header bg-light">
              <h5 class="mb-0">
                <i class="bi bi-truck me-2"></i>
                Delivery Information
              </h5>
            </div>
            <div class="card-body">
              <div v-if="order.deliveryAddress">
                <p class="mb-1 text-muted small">Delivery Address</p>
                <p class="mb-0">
                  <i class="bi bi-geo-alt me-1"></i>
                  {{ order.deliveryAddress.street }}<br />
                  {{ order.deliveryAddress.city }}, {{ order.deliveryAddress.postalCode }}<br />
                  {{ order.deliveryAddress.country }}
                </p>
              </div>

              <hr v-if="order.estimatedDeliveryTime" />

              <div v-if="order.estimatedDeliveryTime">
                <p class="mb-1 text-muted small">Estimated Delivery</p>
                <p class="mb-0">
                  <i class="bi bi-clock me-1"></i>
                  {{ formatDate(order.estimatedDeliveryTime) }}
                </p>
              </div>

              <hr v-if="order.driverId" />

              <div v-if="order.driverId">
                <p class="mb-1 text-muted small">Driver Assigned</p>
                <p class="mb-0">
                  <i class="bi bi-person-badge me-1"></i>
                  Driver ID: {{ order.driverId }}
                </p>
              </div>
            </div>
          </div>

          <!-- Customer Information -->
          <div class="card">
            <div class="card-header bg-light">
              <h5 class="mb-0">
                <i class="bi bi-person me-2"></i>
                Customer
              </h5>
            </div>
            <div class="card-body">
              <p class="mb-0">
                <i class="bi bi-person-circle me-1"></i>
                Customer ID: {{ order.customerId.substring(0, 8) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Order Modal -->
    <div
      v-if="showConfirmModal"
      class="modal show d-block"
      tabindex="-1"
      style="background-color: rgba(0,0,0,0.5)"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Order</h5>
            <button
              type="button"
              class="btn-close"
              @click="showConfirmModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="prepTime" class="form-label">
                Estimated Preparation Time (minutes)
              </label>
              <input
                id="prepTime"
                v-model.number="estimatedPreparationMinutes"
                type="number"
                min="5"
                max="180"
                class="form-control"
              />
              <div class="form-text">
                Default is 30 minutes. This will be used to calculate estimated delivery time.
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showConfirmModal = false"
              :disabled="confirmMutation.isPending.value"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-success"
              @click="handleConfirmOrder"
              :disabled="confirmMutation.isPending.value"
            >
              <span v-if="confirmMutation.isPending.value">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Confirming...
              </span>
              <span v-else>
                <i class="bi bi-check-circle me-2"></i>
                Confirm Order
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrder } from "~/composables/useOrders";
import {
  useConfirmOrder,
  useRejectOrder,
  useUpdateOrderStatus,
} from "~/composables/useRestaurantOrders";

definePageMeta({
  middleware: ["restaurant-owner"],
});

const route = useRoute();
const authStore = useAuthStore();
const orderId = computed(() => route.params.id as string);

const { data: order, isLoading, error } = useOrder(orderId);

// Check if user owns the restaurant
const userOwnsRestaurant = computed(() => {
  if (!order.value || !authStore.user) return false;
  // Admin can access all restaurants
  if (authStore.hasRole("admin")) return true;
  // Check if restaurant ownerId matches user ID
  // Note: We would need to fetch the restaurant details to check ownerId
  // For now, we'll trust the middleware and backend authorization
  return true;
});

const confirmMutation = useConfirmOrder();
const rejectMutation = useRejectOrder();
const updateStatusMutation = useUpdateOrderStatus();

const showConfirmModal = ref(false);
const estimatedPreparationMinutes = ref(30);
const pendingStatus = ref<string | null>(null);

// TODO: Get restaurant ID from authenticated user or route
const restaurantId = computed(() => order.value?.restaurantId || "");

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
 */
const getTotalItems = (items: any[]) => {
  return items.reduce((total, item) => total + item.quantity, 0);
};

/**
 * @brief Check if actions can be performed on this order
 */
const canPerformActions = (status: string) => {
  const actionableStatuses = ["payment_succeeded", "confirmed", "preparing"];
  return actionableStatuses.includes(status);
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

/**
 * @brief Handle confirm order
 */
const handleConfirmOrder = () => {
  confirmMutation.mutate(
    {
      restaurantId: restaurantId.value,
      orderId: orderId.value,
      estimatedPreparationMinutes: estimatedPreparationMinutes.value,
    },
    {
      onSuccess: () => {
        showConfirmModal.value = false;
      },
    }
  );
};

/**
 * @brief Handle reject order
 */
const handleRejectOrder = () => {
  const reason = prompt("Please provide a reason for rejecting this order:");

  if (reason && reason.length >= 5) {
    rejectMutation.mutate({
      restaurantId: restaurantId.value,
      orderId: orderId.value,
      reason: reason,
    });
  } else if (reason !== null) {
    alert("Rejection reason must be at least 5 characters long.");
  }
};

/**
 * @brief Handle update order status
 */
const handleUpdateStatus = (status: "preparing" | "ready_for_pickup") => {
  pendingStatus.value = status;
  updateStatusMutation.mutate(
    {
      orderId: orderId.value,
      status: status,
    },
    {
      onSettled: () => {
        pendingStatus.value = null;
      },
    }
  );
};
</script>
