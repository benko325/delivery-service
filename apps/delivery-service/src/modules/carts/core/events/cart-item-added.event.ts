import { IEvent } from "@nestjs/cqrs";

export class CartItemAddedEvent implements IEvent {
  public readonly cartId: string;
  public readonly customerId: string;
  public readonly menuItemId: string;
  public readonly quantity: number;
  public readonly addedAt: Date;

  constructor(data: {
    cartId: string;
    customerId: string;
    menuItemId: string;
    quantity: number;
    addedAt: Date;
  }) {
    this.cartId = data.cartId;
    this.customerId = data.customerId;
    this.menuItemId = data.menuItemId;
    this.quantity = data.quantity;
    this.addedAt =
      data.addedAt instanceof Date ? data.addedAt : new Date(data.addedAt);
  }
}
