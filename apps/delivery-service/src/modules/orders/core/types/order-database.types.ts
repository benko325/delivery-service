import { Generated } from "kysely";

export type OrderStatus =
  | "pending" // Order created, waiting for restaurant confirmation
  | "confirmed" // Restaurant confirmed the order
  | "preparing" // Restaurant is preparing the order
  | "ready_for_pickup" // Order ready, waiting for driver to accept
  | "driver_assigned" // Driver accepted the order
  | "picked_up" // Driver picked up the order
  | "in_transit" // Driver is on the way
  | "delivered" // Order delivered successfully
  | "cancelled"; // Order was cancelled

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrdersTable {
  id: Generated<string>;
  customerId: string;
  restaurantId: string;
  driverId: string | null;
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  status: OrderStatus;
  totalAmount: number;
  deliveryFee: number;
  currency: string;
  estimatedDeliveryTime: Date | null;
  actualDeliveryTime: Date | null;
  cancelledAt: Date | null;
  cancellationReason: string | null;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export interface OrderDatabase {
  "orders.orders": OrdersTable;
}
