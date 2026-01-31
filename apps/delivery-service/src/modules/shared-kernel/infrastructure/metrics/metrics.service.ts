import { Injectable } from "@nestjs/common";
import { InjectMetric } from "@willsoto/nestjs-prometheus";
import { Counter, Gauge, Histogram } from "prom-client";

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric("orders_created_total")
    private readonly ordersCreatedCounter: Counter<string>,

    @InjectMetric("orders_completed_total")
    private readonly ordersCompletedCounter: Counter<string>,

    @InjectMetric("orders_cancelled_total")
    private readonly ordersCancelledCounter: Counter<string>,

    @InjectMetric("carts_created_total")
    private readonly cartsCreatedCounter: Counter<string>,

    @InjectMetric("cart_items_added_total")
    private readonly cartItemsAddedCounter: Counter<string>,

    @InjectMetric("customers_registered_total")
    private readonly customersRegisteredCounter: Counter<string>,

    @InjectMetric("active_customers")
    private readonly activeCustomersGauge: Gauge<string>,

    @InjectMetric("drivers_registered_total")
    private readonly driversRegisteredCounter: Counter<string>,

    @InjectMetric("active_drivers")
    private readonly activeDriversGauge: Gauge<string>,

    @InjectMetric("restaurants_registered_total")
    private readonly restaurantsRegisteredCounter: Counter<string>,

    @InjectMetric("orders_per_restaurant_total")
    private readonly ordersPerRestaurantCounter: Counter<string>,

    @InjectMetric("delivery_duration_seconds")
    private readonly deliveryDurationHistogram: Histogram<string>,

    // Authentication metrics
    @InjectMetric("login_attempts_total")
    private readonly loginAttemptsCounter: Counter<string>,

    @InjectMetric("token_refresh_total")
    private readonly tokenRefreshCounter: Counter<string>,

    @InjectMetric("registration_attempts_total")
    private readonly registrationAttemptsCounter: Counter<string>,

    // Error metrics
    @InjectMetric("errors_total")
    private readonly errorsCounter: Counter<string>,

    @InjectMetric("unhandled_exceptions_total")
    private readonly unhandledExceptionsCounter: Counter<string>,

    // Revenue metrics
    @InjectMetric("order_amount")
    private readonly orderAmountHistogram: Histogram<string>,

    @InjectMetric("revenue_total")
    private readonly revenueCounter: Counter<string>,
  ) {}

  // Order metrics
  incrementOrdersCreated(status: string = "pending"): void {
    this.ordersCreatedCounter.inc({ status });
  }

  incrementOrdersCompleted(): void {
    this.ordersCompletedCounter.inc();
  }

  incrementOrdersCancelled(): void {
    this.ordersCancelledCounter.inc();
  }

  // Cart metrics
  incrementCartsCreated(): void {
    this.cartsCreatedCounter.inc();
  }

  incrementCartItemsAdded(count: number = 1): void {
    this.cartItemsAddedCounter.inc(count);
  }

  // Customer metrics
  incrementCustomersRegistered(): void {
    this.customersRegisteredCounter.inc();
  }

  setActiveCustomers(count: number): void {
    this.activeCustomersGauge.set(count);
  }

  incrementActiveCustomers(): void {
    this.activeCustomersGauge.inc();
  }

  decrementActiveCustomers(): void {
    this.activeCustomersGauge.dec();
  }

  // Driver metrics
  incrementDriversRegistered(): void {
    this.driversRegisteredCounter.inc();
  }

  setActiveDrivers(count: number): void {
    this.activeDriversGauge.set(count);
  }

  incrementActiveDrivers(): void {
    this.activeDriversGauge.inc();
  }

  decrementActiveDrivers(): void {
    this.activeDriversGauge.dec();
  }

  // Restaurant metrics
  incrementRestaurantsRegistered(): void {
    this.restaurantsRegisteredCounter.inc();
  }

  incrementOrdersPerRestaurant(restaurantId: string): void {
    this.ordersPerRestaurantCounter.inc({ restaurant_id: restaurantId });
  }

  // Delivery metrics
  recordDeliveryDuration(durationSeconds: number, restaurantId?: string): void {
    this.deliveryDurationHistogram.observe(
      { restaurant_id: restaurantId || "unknown" },
      durationSeconds,
    );
  }

  // Authentication metrics
  incrementLoginAttempts(status: "success" | "failure"): void {
    this.loginAttemptsCounter.inc({ status });
  }

  incrementTokenRefresh(status: "success" | "failure"): void {
    this.tokenRefreshCounter.inc({ status });
  }

  incrementRegistrationAttempts(
    status: "success" | "failure",
    userType: "customer" | "driver" | "restaurant",
  ): void {
    this.registrationAttemptsCounter.inc({ status, user_type: userType });
  }

  // Error metrics
  incrementErrors(type: string, statusCode: number): void {
    this.errorsCounter.inc({ type, status_code: statusCode.toString() });
  }

  incrementUnhandledExceptions(exceptionType: string): void {
    this.unhandledExceptionsCounter.inc({ exception_type: exceptionType });
  }

  // Revenue metrics
  recordOrderAmount(amount: number, currency: string = "USD"): void {
    this.orderAmountHistogram.observe({ currency }, amount);
  }

  incrementRevenue(amount: number, currency: string = "USD"): void {
    this.revenueCounter.inc({ currency }, amount);
  }
}
