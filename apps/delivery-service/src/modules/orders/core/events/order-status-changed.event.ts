import { IEvent } from "@nestjs/cqrs";
import { OrderStatus } from "../types/order-database.types";

export class OrderStatusChangedEvent implements IEvent {
  public readonly orderId: string;
  public readonly previousStatus: OrderStatus;
  public readonly newStatus: OrderStatus;
  public readonly changedAt: Date;

  constructor(data: {
    orderId: string;
    previousStatus: OrderStatus;
    newStatus: OrderStatus;
    changedAt: Date;
  }) {
    this.orderId = data.orderId;
    this.previousStatus = data.previousStatus;
    this.newStatus = data.newStatus;
    this.changedAt =
      data.changedAt instanceof Date
        ? data.changedAt
        : new Date(data.changedAt);
  }
}
