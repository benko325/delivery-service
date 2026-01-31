import { IEvent } from "@nestjs/cqrs";

export class OrderCreatedEvent implements IEvent {
  public readonly orderId: string;
  public readonly customerId: string;
  public readonly restaurantId: string;
  public readonly totalAmount: number;
  public readonly createdAt: Date;

  constructor(data: {
    orderId: string;
    customerId: string;
    restaurantId: string;
    totalAmount: number;
    createdAt: Date;
  }) {
    this.orderId = data.orderId;
    this.customerId = data.customerId;
    this.restaurantId = data.restaurantId;
    this.totalAmount = data.totalAmount;
    this.createdAt =
      data.createdAt instanceof Date
        ? data.createdAt
        : new Date(data.createdAt);
  }
}
