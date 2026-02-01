import { EventsHandler, IEventHandler, EventBus } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { IEvent } from "@nestjs/cqrs";
import { DeliveryRejectedEvent } from "@/modules/drivers/core/events/delivery-rejected.event";

export class DeliveryRejectedMappedEvent implements IEvent {
  constructor(
    public readonly driverId: string,
    public readonly orderId: string,
    public readonly reason: string,
    public readonly rejectedAt: Date,
  ) {}
}

@EventsHandler(DeliveryRejectedEvent)
export class DeliveryRejectedEventMapper
  implements IEventHandler<DeliveryRejectedEvent>
{
  private readonly logger = new Logger(DeliveryRejectedEventMapper.name);

  constructor(private readonly eventBus: EventBus) {}

  handle(event: DeliveryRejectedEvent): void {
    this.logger.log(`Mapping DeliveryRejectedEvent for order ${event.orderId}`);

    const mappedEvent = new DeliveryRejectedMappedEvent(
      event.driverId,
      event.orderId,
      event.reason,
      event.rejectedAt,
    );

    this.eventBus.subject$.next(mappedEvent);

    this.logger.log(
      `Mapped event published for rejected order ${event.orderId}`,
    );
  }
}
