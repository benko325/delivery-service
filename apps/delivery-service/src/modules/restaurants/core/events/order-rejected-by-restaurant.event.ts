import { IEvent } from "@nestjs/cqrs";

export class OrderRejectedByRestaurantEvent implements IEvent {
  public readonly orderId: string;
  public readonly restaurantId: string;
  public readonly reason: string;
  public readonly rejectedAt: Date;

  constructor(data: {
    orderId: string;
    restaurantId: string;
    reason: string;
    rejectedAt: Date;
  }) {
    this.orderId = data.orderId;
    this.restaurantId = data.restaurantId;
    this.reason = data.reason;
    this.rejectedAt =
      data.rejectedAt instanceof Date
        ? data.rejectedAt
        : new Date(data.rejectedAt);
  }
}
