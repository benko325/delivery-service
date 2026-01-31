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

    @InjectMetric("delivery_duration_seconds")
    private readonly deliveryDurationHistogram: Histogram<string>,
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

  // Delivery metrics
  recordDeliveryDuration(durationSeconds: number, restaurantId?: string): void {
    this.deliveryDurationHistogram.observe(
      { restaurant_id: restaurantId || "unknown" },
      durationSeconds,
    );
  }
}
