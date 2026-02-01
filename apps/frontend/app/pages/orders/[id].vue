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
      Failed to load order details: {{ error.message }}
    </div>

    <!-- Order Details -->
    <div v-else-if="order">
      <div class="row">
        <!-- Order Info -->
        <div class="col-lg-8">
          <!-- Order Header -->
          <div class="card mb-4">
            <div
              class="card-header bg-primary text-white d-flex justify-content-between align-items-center"
            >
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

              <!-- Timeline Information -->
              <div
                v-if="
                  order.estimatedDeliveryTime ||
                  order.actualDeliveryTime ||
                  order.cancelledAt
                "
                class="mb-3"
              >
                <hr />
                <h6 class="mb-3">Order Timeline</h6>

                <div
                  v-if="order.estimatedDeliveryTime"
                  class="d-flex align-items-start mb-2"
                >
                  <i class="bi bi-clock text-primary me-2 mt-1"></i>
                  <div>
                    <strong>Estimated Delivery:</strong><br />
                    <span class="text-muted">{{
                      formatDate(order.estimatedDeliveryTime)
                    }}</span>
                  </div>
                </div>

                <div
                  v-if="order.actualDeliveryTime"
                  class="d-flex align-items-start mb-2"
                >
                  <i class="bi bi-check-circle text-success me-2 mt-1"></i>
                  <div>
                    <strong>Delivered:</strong><br />
                    <span class="text-success">{{
                      formatDate(order.actualDeliveryTime)
                    }}</span>
                  </div>
                </div>

                <div
                  v-if="order.cancelledAt"
                  class="d-flex align-items-start mb-2"
                >
                  <i class="bi bi-x-circle text-danger me-2 mt-1"></i>
                  <div>
                    <strong>Cancelled:</strong><br />
                    <span class="text-danger">{{
                      formatDate(order.cancelledAt)
                    }}</span>
                    <p v-if="order.cancellationReason" class="mb-0 mt-1 small">
                      <em>Reason: {{ order.cancellationReason }}</em>
                    </p>
                  </div>
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
                      <td class="text-end">
                        {{ formatPrice(item.price, item.currency) }}
                      </td>
                      <td class="text-end">
                        {{
                          formatPrice(item.price * item.quantity, item.currency)
                        }}
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
                    <span>{{
                      formatPrice(
                        order.totalAmount - order.deliveryFee,
                        order.currency,
                      )
                    }}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span>Delivery Fee:</span>
                    <span>{{
                      formatPrice(order.deliveryFee, order.currency)
                    }}</span>
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

          <!-- Actions -->
          <div v-if="canPerformActions(order.status)" class="card">
            <div class="card-body">
              <h5 class="card-title mb-3">
                <i class="bi bi-lightning me-2"></i>
                Order Actions
              </h5>
              <div class="d-flex gap-2 flex-wrap">
                <button
                  v-if="order.status === 'pending'"
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
                  v-if="canCancelOrder(order.status)"
                  class="btn btn-outline-danger"
                  @click="handleCancelOrder"
                  :disabled="cancelMutation.isPending.value"
                >
                  <span v-if="cancelMutation.isPending.value">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Cancelling...
                  </span>
                  <span v-else>
                    <i class="bi bi-x-circle me-2"></i>
                    Cancel Order
                  </span>
                </button>
              </div>

              <!-- Error Messages -->
              <div
                v-if="payMutation.isError.value"
                class="alert alert-danger mt-3 mb-0"
              >
                <i class="bi bi-exclamation-triangle me-2"></i>
                Payment failed. Please try again.
              </div>
              <div
                v-if="cancelMutation.isError.value"
                class="alert alert-danger mt-3 mb-0"
              >
                <i class="bi bi-exclamation-triangle me-2"></i>
                Failed to cancel order. Please try again.
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
                  {{ order.deliveryAddress.city }},
                  {{ order.deliveryAddress.postalCode }}<br />
                  {{ order.deliveryAddress.country }}
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

          <!-- Order Status Guide -->
          <div class="card">
            <div class="card-header bg-light">
              <h5 class="mb-0">
                <i class="bi bi-info-circle me-2"></i>
                Status Guide
              </h5>
            </div>
            <div class="card-body">
              <ul class="list-unstyled small mb-0">
                <li class="mb-2">
                  <span class="badge bg-warning text-dark">PENDING</span>
                  <span class="ms-2">Awaiting payment</span>
                </li>
                <li class="mb-2">
                  <span class="badge bg-info text-dark">PAYMENT SUCCEEDED</span>
                  <span class="ms-2">Payment confirmed</span>
                </li>
                <li class="mb-2">
                  <span class="badge bg-primary">CONFIRMED</span>
                  <span class="ms-2">Restaurant confirmed</span>
                </li>
                <li class="mb-2">
                  <span class="badge bg-info">PREPARING</span>
                  <span class="ms-2">Being prepared</span>
                </li>
                <li class="mb-2">
                  <span class="badge bg-success">READY FOR PICKUP</span>
                  <span class="ms-2">Ready for delivery</span>
                </li>
                <li class="mb-2">
                  <span class="badge bg-primary">IN TRANSIT</span>
                  <span class="ms-2">Out for delivery</span>
                </li>
                <li class="mb-2">
                  <span class="badge bg-success">DELIVERED</span>
                  <span class="ms-2">Order completed</span>
                </li>
                <li class="mb-0">
                  <span class="badge bg-danger">CANCELLED</span>
                  <span class="ms-2">Order cancelled</span>
                </li>
              </ul>
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

const route = useRoute();
const router = useRouter();
const orderId = computed(() => route.params.id as string);

const { data: order, isLoading, error } = useOrder(orderId);
const payMutation = usePayForOrder();
const cancelMutation = useCancelOrder();

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
 * @brief Check if actions can be performed on this order
 * @param status Order status
 * @return True if actions are available
 */
const canPerformActions = (status: string) => {
  const actionableStatuses = ["pending", "payment_succeeded", "confirmed"];
  return actionableStatuses.includes(status);
};

/**
 * @brief Check if order can be cancelled
 * @param status Order status
 * @return True if order can be cancelled
 */
const canCancelOrder = (status: string) => {
  const cancellableStatuses = ["pending", "payment_succeeded", "confirmed"];
  return cancellableStatuses.includes(status);
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
 * @brief Handle pay for order
 */
const handlePayOrder = () => {
  payMutation.mutate(
    { orderId: orderId.value },
    {
      onSuccess: () => {
        // Order will be refetched automatically via query invalidation
      },
    },
  );
};

/**
 * @brief Handle cancel order
 */
const handleCancelOrder = () => {
  const reason = prompt("Please provide a reason for cancellation:");

  if (reason && reason.length >= 5) {
    cancelMutation.mutate(
      {
        orderId: orderId.value,
        reason: reason,
      },
      {
        onSuccess: () => {
          // Order will be refetched automatically via query invalidation
        },
      },
    );
  } else if (reason !== null) {
    alert("Cancellation reason must be at least 5 characters long.");
  }
};
</script>
