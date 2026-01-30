import { IEvent } from "@nestjs/cqrs";

export class OrderConfirmedByRestaurantEvent implements IEvent {
  public readonly orderId: string;
  public readonly restaurantId: string;
  public readonly estimatedPreparationMinutes: number;
  public readonly confirmedAt: Date;

  constructor(data: {
    orderId: string;
    restaurantId: string;
    estimatedPreparationMinutes: number;
    confirmedAt: Date;
  }) {
    this.orderId = data.orderId;
    this.restaurantId = data.restaurantId;
    this.estimatedPreparationMinutes = data.estimatedPreparationMinutes;
    this.confirmedAt =
      data.confirmedAt instanceof Date
        ? data.confirmedAt
        : new Date(data.confirmedAt);
  }
}
