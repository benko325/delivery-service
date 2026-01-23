import { EventsHandler, IEventHandler, EventBus } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
// import { CartOrderedEvent } from "../../../carts/core/events/cart-ordered.event";

import { IEvent } from "@nestjs/cqrs";
import {
  OrderItem,
  DeliveryAddress,
} from "../../core/types/order-database.types";

export class CartOrderedMappedEvent implements IEvent {
  constructor(
    public readonly customerId: string,
    public readonly restaurantId: string,
    public readonly items: OrderItem[],
    public readonly deliveryAddress: DeliveryAddress,
    public readonly totalAmount: number,
    public readonly deliveryFee: number,
    public readonly currency: string,
  ) {}
}

/**
 * @todo This class is only a placeholder. Replace with actual import from Carts BC when available.
 */
class CartOrderedEventMock implements IEvent {
  constructor(
    public readonly cartId: string,
    public readonly customerId: string,
    public readonly restaurantId: string,
    public readonly items: {
      menuItemId: string;
      name: string;
      quantity: number;
      price: number;
      currency: string;
    }[],
    public readonly deliveryAddress: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    },
    public readonly totalAmount: number,
    public readonly deliveryFee: number,
    public readonly currency: string,
    public readonly orderedAt: Date,
  ) {}
}

@EventsHandler(CartOrderedEventMock)
export class CartOrderedEventMapper implements IEventHandler<CartOrderedEventMock> {
  private readonly logger = new Logger(CartOrderedEventMapper.name);

  constructor(private readonly eventBus: EventBus) {}

  handle(event: CartOrderedEventMock): void {
    this.logger.log(`Mapping CartOrderedEvent for cart ${event.cartId}`);

    const orderItems: OrderItem[] = event.items.map((item) => ({
      menuItemId: item.menuItemId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      currency: item.currency,
    }));

    const deliveryAddress: DeliveryAddress = {
      street: event.deliveryAddress.street,
      city: event.deliveryAddress.city,
      postalCode: event.deliveryAddress.postalCode,
      country: event.deliveryAddress.country,
    };

    const mappedEvent = new CartOrderedMappedEvent(
      event.customerId,
      event.restaurantId,
      orderItems,
      deliveryAddress,
      event.totalAmount,
      event.deliveryFee,
      event.currency,
    );

    this.eventBus.publish(mappedEvent);

    this.logger.log(`Mapped event published for customer ${event.customerId}`);
  }
}
