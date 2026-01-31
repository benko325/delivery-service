import {
  makeCounterProvider,
  makeGaugeProvider,
  makeHistogramProvider,
} from "@willsoto/nestjs-prometheus";

// HTTP Request Duration Histogram
export const httpRequestDurationProvider = makeHistogramProvider({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
});

// Order Metrics
export const ordersCreatedCounterProvider = makeCounterProvider({
  name: "orders_created_total",
  help: "Total number of orders created",
  labelNames: ["status"],
});

export const ordersCompletedCounterProvider = makeCounterProvider({
  name: "orders_completed_total",
  help: "Total number of orders completed",
});

export const ordersCancelledCounterProvider = makeCounterProvider({
  name: "orders_cancelled_total",
  help: "Total number of orders cancelled",
});

// Cart Metrics
export const cartsCreatedCounterProvider = makeCounterProvider({
  name: "carts_created_total",
  help: "Total number of carts created",
});

export const cartItemsAddedCounterProvider = makeCounterProvider({
  name: "cart_items_added_total",
  help: "Total number of items added to carts",
});

// Customer Metrics
export const customersRegisteredCounterProvider = makeCounterProvider({
  name: "customers_registered_total",
  help: "Total number of customers registered",
});

export const activeCustomersGaugeProvider = makeGaugeProvider({
  name: "active_customers",
  help: "Number of currently active customers",
});

// Driver Metrics
export const driversRegisteredCounterProvider = makeCounterProvider({
  name: "drivers_registered_total",
  help: "Total number of drivers registered",
});

export const activeDriversGaugeProvider = makeGaugeProvider({
  name: "active_drivers",
  help: "Number of currently active/available drivers",
});

// Restaurant Metrics
export const restaurantsRegisteredCounterProvider = makeCounterProvider({
  name: "restaurants_registered_total",
  help: "Total number of restaurants registered",
});

// Delivery Metrics
export const deliveryDurationHistogramProvider = makeHistogramProvider({
  name: "delivery_duration_seconds",
  help: "Duration of deliveries in seconds",
  labelNames: ["restaurant_id"],
  buckets: [300, 600, 900, 1200, 1800, 2700, 3600], // 5min to 1hour
});

// All metric providers for easy export
export const metricsProviders = [
  httpRequestDurationProvider,
  ordersCreatedCounterProvider,
  ordersCompletedCounterProvider,
  ordersCancelledCounterProvider,
  cartsCreatedCounterProvider,
  cartItemsAddedCounterProvider,
  customersRegisteredCounterProvider,
  activeCustomersGaugeProvider,
  driversRegisteredCounterProvider,
  activeDriversGaugeProvider,
  restaurantsRegisteredCounterProvider,
  deliveryDurationHistogramProvider,
];
