import { IEvent } from "@nestjs/cqrs";

export class RestaurantDeactivatedEvent implements IEvent {
  public readonly restaurantId: string;
  public readonly ownerId: string;
  public readonly name: string;
  public readonly deactivatedAt: Date;

  constructor(data: {
    restaurantId: string;
    ownerId: string;
    name: string;
    deactivatedAt: Date;
  }) {
    this.restaurantId = data.restaurantId;
    this.ownerId = data.ownerId;
    this.name = data.name;
    this.deactivatedAt =
      data.deactivatedAt instanceof Date
        ? data.deactivatedAt
        : new Date(data.deactivatedAt);
  }
}
