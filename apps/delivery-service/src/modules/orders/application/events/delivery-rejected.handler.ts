import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { DeliveryRejectedMappedEvent } from "../../infrastructure/anti-corruption-layer/delivery-rejected.mapper";

@EventsHandler(DeliveryRejectedMappedEvent)
export class DeliveryRejectedEventHandler
  implements IEventHandler<DeliveryRejectedMappedEvent>
{
  private readonly logger = new Logger(DeliveryRejectedEventHandler.name);

  async handle(event: DeliveryRejectedMappedEvent): Promise<void> {
    this.logger.log(
      `Driver ${event.driverId} rejected order ${event.orderId}: ${event.reason}`,
    );

    // Order remains "ready_for_pickup" for other drivers to accept
    // No action needed, just logging the rejection
  }
}
