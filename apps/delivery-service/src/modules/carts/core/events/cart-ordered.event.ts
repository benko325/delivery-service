import { IEvent } from "@nestjs/cqrs";
import { CartItem } from "../types/cart-database.types";
import { DeliveryAddress } from "../types/delivery-address.types";

export class CartOrderedEvent implements IEvent {
  public readonly cartId: string;
  public readonly customerId: string;
  public readonly restaurantId: string;
  public readonly items: CartItem[];
  public readonly totalAmount: number;
  public readonly currency: string;
  public readonly deliveryAddress: DeliveryAddress;
  public readonly deliveryFee: number;
  public readonly orderedAt: Date;

  constructor(data: {
    cartId: string;
    customerId: string;
    restaurantId: string;
    items: CartItem[];
    totalAmount: number;
    currency: string;
    deliveryAddress: DeliveryAddress;
    deliveryFee: number;
    orderedAt: Date;
  }) {
    this.cartId = data.cartId;
    this.customerId = data.customerId;
    this.restaurantId = data.restaurantId;
    this.items = data.items;
    this.totalAmount = data.totalAmount;
    this.currency = data.currency;
    this.deliveryAddress = data.deliveryAddress;
    this.deliveryFee = data.deliveryFee;
    this.orderedAt =
      data.orderedAt instanceof Date
        ? data.orderedAt
        : new Date(data.orderedAt);
  }
}
