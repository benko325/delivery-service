import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";
import { DeliveryRejectedMappedEvent } from "../../infrastructure/anti-corruption-layer/delivery-rejected.mapper";

@EventsHandler(DeliveryRejectedMappedEvent)
export class DeliveryRejectedEventHandler implements IEventHandler<DeliveryRejectedMappedEvent> {
  constructor(
    @InjectPinoLogger(DeliveryRejectedEventHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async handle(event: DeliveryRejectedMappedEvent): Promise<void> {
    this.logger.info(
      `Driver ${event.driverId} rejected order ${event.orderId}: ${event.reason}`,
    );

    // Order remains "ready_for_pickup" for other drivers to accept
    // No action needed, just logging the rejection
  }
}
