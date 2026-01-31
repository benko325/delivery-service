import { IEvent } from "@nestjs/cqrs";
import { MenuItemCategory } from "../types/restaurant-database.types";

export class MenuItemCreatedEvent implements IEvent {
  public readonly id: string;
  public readonly restaurantId: string;
  public readonly name: string;
  public readonly price: number;
  public readonly category: MenuItemCategory;
  public readonly createdAt: Date;

  constructor(data: {
    id: string;
    restaurantId: string;
    name: string;
    price: number;
    category: MenuItemCategory;
    createdAt: Date;
  }) {
    this.id = data.id;
    this.restaurantId = data.restaurantId;
    this.name = data.name;
    this.price = data.price;
    this.category = data.category;
    this.createdAt =
      data.createdAt instanceof Date
        ? data.createdAt
        : new Date(data.createdAt);
  }
}
