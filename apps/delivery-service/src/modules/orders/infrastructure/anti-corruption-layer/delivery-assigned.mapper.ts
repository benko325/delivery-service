import { EventsHandler, IEventHandler, EventBus } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { IEvent } from "@nestjs/cqrs";
import { DeliveryAssignedEvent } from "@/modules/drivers/core/events/delivery-assigned.event";

export class DeliveryAssignedMappedEvent implements IEvent {
  constructor(
    public readonly driverId: string,
    public readonly orderId: string,
    public readonly assignedAt: Date,
  ) {}
}

@EventsHandler(DeliveryAssignedEvent)
export class DeliveryAssignedEventMapper
  implements IEventHandler<DeliveryAssignedEvent>
{
  private readonly logger = new Logger(DeliveryAssignedEventMapper.name);

  constructor(private readonly eventBus: EventBus) {}

  handle(event: DeliveryAssignedEvent): void {
    this.logger.log(`Mapping DeliveryAssignedEvent for order ${event.orderId}`);

    const mappedEvent = new DeliveryAssignedMappedEvent(
      event.driverId,
      event.orderId,
      event.assignedAt,
    );

    this.eventBus.subject$.next(mappedEvent);

    this.logger.log(
      `Mapped event published for order ${event.orderId} assigned to driver ${event.driverId}`,
    );
  }
}
