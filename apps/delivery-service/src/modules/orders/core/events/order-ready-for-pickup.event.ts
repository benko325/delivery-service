import { IEvent } from "@nestjs/cqrs";
import { DeliveryAddress } from "../types/order-database.types";

export class OrderReadyForPickupEvent implements IEvent {
  public readonly orderId: string;
  public readonly restaurantId: string;
  public readonly deliveryAddress: DeliveryAddress;
  public readonly readyAt: Date;

  constructor(data: {
    orderId: string;
    restaurantId: string;
    deliveryAddress: DeliveryAddress;
    readyAt: Date;
  }) {
    this.orderId = data.orderId;
    this.restaurantId = data.restaurantId;
    this.deliveryAddress = data.deliveryAddress;
    this.readyAt =
      data.readyAt instanceof Date ? data.readyAt : new Date(data.readyAt);
  }
}
