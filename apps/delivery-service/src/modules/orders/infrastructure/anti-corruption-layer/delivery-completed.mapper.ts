import { EventsHandler, IEventHandler, EventBus } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { IEvent } from "@nestjs/cqrs";
import { DeliveryCompletedEvent } from "@/modules/drivers/core/events/delivery-completed.event";

export class DeliveryCompletedMappedEvent implements IEvent {
  constructor(
    public readonly driverId: string,
    public readonly orderId: string,
    public readonly completedAt: Date,
  ) {}
}

@EventsHandler(DeliveryCompletedEvent)
export class DeliveryCompletedEventMapper
  implements IEventHandler<DeliveryCompletedEvent>
{
  private readonly logger = new Logger(DeliveryCompletedEventMapper.name);

  constructor(private readonly eventBus: EventBus) {}

  handle(event: DeliveryCompletedEvent): void {
    this.logger.log(
      `Mapping DeliveryCompletedEvent for order ${event.orderId}`,
    );

    const mappedEvent = new DeliveryCompletedMappedEvent(
      event.driverId,
      event.orderId,
      event.completedAt,
    );

    this.eventBus.subject$.next(mappedEvent);

    this.logger.log(
      `Mapped event published for completed order ${event.orderId}`,
    );
  }
}
