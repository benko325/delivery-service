import { EventsHandler, IEventHandler, EventBus } from "@nestjs/cqrs";
import { IEvent } from "@nestjs/cqrs";
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";
import { DeliveryAssignedEvent } from "@/modules/drivers/core/events/delivery-assigned.event";

export class DeliveryAssignedMappedEvent implements IEvent {
  constructor(
    public readonly driverId: string,
    public readonly orderId: string,
    public readonly assignedAt: Date,
  ) {}
}

@EventsHandler(DeliveryAssignedEvent)
export class DeliveryAssignedEventMapper implements IEventHandler<DeliveryAssignedEvent> {
  constructor(
    private readonly eventBus: EventBus,
    @InjectPinoLogger(DeliveryAssignedEventMapper.name)
    private readonly logger: PinoLogger,
  ) {}

  handle(event: DeliveryAssignedEvent): void {
    this.logger.info(
      `Mapping DeliveryAssignedEvent for order ${event.orderId}`,
    );

    const mappedEvent = new DeliveryAssignedMappedEvent(
      event.driverId,
      event.orderId,
      event.assignedAt,
    );

    this.eventBus.subject$.next(mappedEvent);

    this.logger.info(
      `Mapped event published for order ${event.orderId} assigned to driver ${event.driverId}`,
    );
  }
}
