import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { OrderReadyForPickupMappedEvent } from "../../infrastructure/anti-corruption-layer/order-ready-for-pickup.mapper";

@EventsHandler(OrderReadyForPickupMappedEvent)
export class OrderReadyForPickupEventHandler
  implements IEventHandler<OrderReadyForPickupMappedEvent>
{
  private readonly logger = new Logger(OrderReadyForPickupEventHandler.name);

  async handle(event: OrderReadyForPickupMappedEvent): Promise<void> {
    this.logger.log(
      `Order Ready for Pickup notification received in Drivers module for order ${event.orderId}`,
    );

    // Future: Trigger push notifications to nearby available drivers
    // For now, just log the event for awareness
  }
}
