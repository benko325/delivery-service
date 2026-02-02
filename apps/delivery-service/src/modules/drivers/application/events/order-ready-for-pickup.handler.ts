import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";
import { OrderReadyForPickupMappedEvent } from "../../infrastructure/anti-corruption-layer/order-ready-for-pickup.mapper";

@EventsHandler(OrderReadyForPickupMappedEvent)
export class OrderReadyForPickupEventHandler implements IEventHandler<OrderReadyForPickupMappedEvent> {
  constructor(
    @InjectPinoLogger(OrderReadyForPickupEventHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async handle(event: OrderReadyForPickupMappedEvent): Promise<void> {
    this.logger.info(
      `Order Ready for Pickup notification received in Drivers module for order ${event.orderId}`,
    );

    // Future: Trigger push notifications to nearby available drivers
    // For now, just log the event for awareness
  }
}
