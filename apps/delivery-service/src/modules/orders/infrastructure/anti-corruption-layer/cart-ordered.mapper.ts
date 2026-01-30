import { EventsHandler, IEventHandler, CommandBus } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { CartOrderedEvent } from "../../../carts/core/events/cart-ordered.event";
import { CreateOrderCommand } from "../../application/commands/create-order/create-order.command";
import {
  OrderItem,
  DeliveryAddress,
} from "../../core/types/order-database.types";

@EventsHandler(CartOrderedEvent)
export class CartOrderedEventHandler implements IEventHandler<CartOrderedEvent> {
  private readonly logger = new Logger(CartOrderedEventHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: CartOrderedEvent): Promise<void> {
    this.logger.log(
      `Handling CartOrderedEvent for customer: ${event.customerId}`,
    );

    // Anti-corruption layer: Map Carts domain types to Orders domain types
    const orderItems: OrderItem[] = event.items.map((cartItem) => ({
      menuItemId: cartItem.menuItemId,
      name: cartItem.name,
      price: cartItem.price,
      quantity: cartItem.quantity,
    }));

    const deliveryAddress: DeliveryAddress = {
      street: event.deliveryAddress.street,
      city: event.deliveryAddress.city,
      postalCode: event.deliveryAddress.postalCode,
      country: event.deliveryAddress.country,
      latitude: event.deliveryAddress.latitude,
      longitude: event.deliveryAddress.longitude,
      instructions: event.deliveryAddress.instructions,
    };

    await this.commandBus.execute(
      new CreateOrderCommand(
        event.customerId,
        event.restaurantId,
        orderItems,
        deliveryAddress,
        event.totalAmount,
        event.deliveryFee,
      ),
    );

    this.logger.log(`Order created from cart: ${event.cartId}`);
  }
}
