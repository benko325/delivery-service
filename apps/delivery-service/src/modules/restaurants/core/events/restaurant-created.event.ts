import { IEvent } from "@nestjs/cqrs";
import { RestaurantAddress } from "../types/restaurant-database.types";

export class RestaurantCreatedEvent implements IEvent {
  public readonly id: string;
  public readonly ownerId: string;
  public readonly name: string;
  public readonly address: RestaurantAddress;
  public readonly createdAt: Date;

  constructor(data: {
    id: string;
    ownerId: string;
    name: string;
    address: RestaurantAddress;
    createdAt: Date;
  }) {
    this.id = data.id;
    this.ownerId = data.ownerId;
    this.name = data.name;
    this.address = data.address;
    this.createdAt =
      data.createdAt instanceof Date
        ? data.createdAt
        : new Date(data.createdAt);
  }
}
