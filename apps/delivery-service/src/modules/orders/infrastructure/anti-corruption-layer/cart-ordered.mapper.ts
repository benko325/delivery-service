import { EventsHandler, IEventHandler, EventBus } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
// import { CartOrderedEvent } from "../../../carts/core/events/cart-ordered.event";

import { IEvent } from "@nestjs/cqrs";
import {
  OrderItem,
  DeliveryAddress,
} from "../../core/types/order-database.types";
import { CartOrderedEvent } from "@/modules/carts/core/events/cart-ordered.event";

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

@EventsHandler(CartOrderedEvent)
export class CartOrderedEventMapper implements IEventHandler<CartOrderedEvent> {
  private readonly logger = new Logger(CartOrderedEventMapper.name);

  constructor(private readonly eventBus: EventBus) {}

  handle(event: CartOrderedEvent): void {
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

    this.eventBus.subject$.next(mappedEvent);

    this.logger.log(`Mapped event published for customer ${event.customerId}`);
  }
}
