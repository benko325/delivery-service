import { IEvent } from "@nestjs/cqrs";

export class CartClearedEvent implements IEvent {
  public readonly cartId: string;
  public readonly customerId: string;
  public readonly clearedAt: Date;

  constructor(data: { cartId: string; customerId: string; clearedAt: Date }) {
    this.cartId = data.cartId;
    this.customerId = data.customerId;
    this.clearedAt =
      data.clearedAt instanceof Date
        ? data.clearedAt
        : new Date(data.clearedAt);
  }
}
