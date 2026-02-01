<template>
  <div>
    <!-- Back Button -->
    <NuxtLink to="/driver/deliveries" class="btn btn-outline-secondary mb-3">
      <i class="bi bi-arrow-left me-2"></i>
      Back to Deliveries
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
                  <div class="d-flex justify-content-between mb-2 text-success">
                    <span>Delivery Fee (Your Earnings):</span>
                    <span><strong>{{ formatPrice(order.deliveryFee, order.currency) }}</strong></span>
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

          <!-- Driver Actions -->
          <div v-if="canPerformActions(order.status)" class="card mb-4">
            <div class="card-body">
              <h5 class="card-title mb-3">
                <i class="bi bi-lightning me-2"></i>
                Delivery Actions
              </h5>

              <div class="d-flex gap-2 flex-wrap">
                <!-- Accept Order (if available) -->
                <button
                  v-if="!order.driverId"
                  class="btn btn-success"
                  @click="showAcceptModal = true"
                  :disabled="acceptMutation.isPending.value"
                >
                  <i class="bi bi-hand-thumbs-up me-2"></i>
                  Accept This Order
                </button>

                <!-- Mark as Picked Up -->
                <button
                  v-if="order.status === 'ready_for_pickup' && order.driverId"
                  class="btn btn-primary"
                  @click="handleUpdateStatus('in_transit')"
                  :disabled="updateStatusMutation.isPending.value"
                >
                  <span v-if="updateStatusMutation.isPending.value && pendingStatus === 'in_transit'">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Updating...
                  </span>
                  <span v-else>
                    <i class="bi bi-box-arrow-up me-2"></i>
                    Mark as Picked Up
                  </span>
                </button>

                <!-- Mark as Delivered -->
                <button
                  v-if="order.status === 'in_transit'"
                  class="btn btn-success"
                  @click="handleUpdateStatus('delivered')"
                  :disabled="updateStatusMutation.isPending.value"
                >
                  <span v-if="updateStatusMutation.isPending.value && pendingStatus === 'delivered'">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Updating...
                  </span>
                  <span v-else>
                    <i class="bi bi-check-circle me-2"></i>
                    Mark as Delivered
                  </span>
                </button>

                <!-- Report Issue -->
                <button
                  v-if="order.driverId"
                  class="btn btn-outline-danger"
                  @click="handleReportIssue"
                  :disabled="reportIssueMutation.isPending.value"
                >
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  Report Issue
                </button>
              </div>

              <!-- Error Messages -->
              <div v-if="acceptMutation.isError.value" class="alert alert-danger mt-3 mb-0">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Failed to accept order. Please try again.
              </div>
              <div v-if="updateStatusMutation.isError.value" class="alert alert-danger mt-3 mb-0">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Failed to update order status. Please try again.
              </div>
              <div v-if="reportIssueMutation.isError.value" class="alert alert-danger mt-3 mb-0">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Failed to report issue. Please try again.
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
                <i class="bi bi-geo-alt me-2"></i>
                Delivery Address
              </h5>
            </div>
            <div class="card-body">
              <div v-if="order.deliveryAddress">
                <p class="mb-2">
                  <strong>{{ order.deliveryAddress.street }}</strong><br />
                  {{ order.deliveryAddress.city }}, {{ order.deliveryAddress.postalCode }}<br />
                  {{ order.deliveryAddress.country }}
                </p>

                <!-- Map Link -->
                <a
                  :href="getMapLink(order.deliveryAddress)"
                  target="_blank"
                  class="btn btn-outline-primary btn-sm w-100"
                >
                  <i class="bi bi-map me-2"></i>
                  Open in Maps
                </a>
              </div>

              <hr v-if="order.estimatedDeliveryTime" />

              <div v-if="order.estimatedDeliveryTime">
                <p class="mb-1 text-muted small">Estimated Delivery</p>
                <p class="mb-0">
                  <i class="bi bi-clock me-1"></i>
                  {{ formatDate(order.estimatedDeliveryTime) }}
                </p>
              </div>

              <hr v-if="order.actualDeliveryTime" />

              <div v-if="order.actualDeliveryTime">
                <p class="mb-1 text-muted small">Actual Delivery Time</p>
                <p class="mb-0 text-success">
                  <i class="bi bi-check-circle me-1"></i>
                  {{ formatDate(order.actualDeliveryTime) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Customer & Restaurant Info -->
          <div class="card mb-3">
            <div class="card-header bg-light">
              <h5 class="mb-0">
                <i class="bi bi-info-circle me-2"></i>
                Order Info
              </h5>
            </div>
            <div class="card-body">
              <p class="mb-2">
                <strong>Customer ID:</strong><br />
                <span class="small text-muted">{{ order.customerId.substring(0, 16) }}...</span>
              </p>
              <p class="mb-0">
                <strong>Restaurant ID:</strong><br />
                <span class="small text-muted">{{ order.restaurantId.substring(0, 16) }}...</span>
              </p>
            </div>
          </div>

          <!-- Status Guide -->
          <div class="card">
            <div class="card-header bg-light">
              <h5 class="mb-0">
                <i class="bi bi-lightbulb me-2"></i>
                Delivery Flow
              </h5>
            </div>
            <div class="card-body">
              <ul class="list-unstyled mb-0 small">
                <li class="mb-2">
                  <span class="badge bg-success">ready_for_pickup</span>
                  <span class="ms-2">→ Accept & Pick up the order</span>
                </li>
                <li class="mb-2">
                  <span class="badge bg-info">in_transit</span>
                  <span class="ms-2">→ Deliver to customer</span>
                </li>
                <li>
                  <span class="badge bg-success">delivered</span>
                  <span class="ms-2">→ Order completed!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Accept Order Modal -->
    <div
      v-if="showAcceptModal"
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
              @click="showAcceptModal = false"
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
              @click="showAcceptModal = false"
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
import { useOrder } from "~/composables/useOrders";
import {
  useAcceptOrder,
  useUpdateDeliveryStatus,
  useReportIssue,
} from "~/composables/useDriverOrders";

definePageMeta({
  middleware: ["driver"],
});

const route = useRoute();
const orderId = computed(() => route.params.id as string);

const { data: order, isLoading, error } = useOrder(orderId);
const acceptMutation = useAcceptOrder();
const updateStatusMutation = useUpdateDeliveryStatus();
const reportIssueMutation = useReportIssue();

const showAcceptModal = ref(false);
const estimatedMinutes = ref(30);
const pendingStatus = ref<string | null>(null);

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
  const actionableStatuses = ["ready_for_pickup", "in_transit"];
  return actionableStatuses.includes(status) || !order.value?.driverId;
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
 * @brief Get map link for address
 */
const getMapLink = (address: any) => {
  const query = encodeURIComponent(
    `${address.street}, ${address.city}, ${address.postalCode}, ${address.country}`
  );
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

/**
 * @brief Handle accept order
 */
const handleAcceptOrder = () => {
  if (!orderId.value) return;

  acceptMutation.mutate(
    {
      orderId: orderId.value,
      estimatedMinutes: estimatedMinutes.value,
    },
    {
      onSuccess: () => {
        showAcceptModal.value = false;
      },
    }
  );
};

/**
 * @brief Handle update order status
 */
const handleUpdateStatus = (status: "in_transit" | "delivered") => {
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

/**
 * @brief Handle report issue
 */
const handleReportIssue = () => {
  const reason = prompt(
    "Please describe the issue you're experiencing with this delivery:"
  );

  if (reason && reason.length >= 5) {
    reportIssueMutation.mutate({
      orderId: orderId.value,
      reason: reason,
    });
  } else if (reason !== null) {
    alert("Issue description must be at least 5 characters long.");
  }
};
</script>
