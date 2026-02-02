import { EventsHandler, IEventHandler, EventBus } from "@nestjs/cqrs";
import { IEvent } from "@nestjs/cqrs";
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";
import { DeliveryCompletedEvent } from "@/modules/drivers/core/events/delivery-completed.event";

export class DeliveryCompletedMappedEvent implements IEvent {
  constructor(
    public readonly driverId: string,
    public readonly orderId: string,
    public readonly completedAt: Date,
  ) {}
}

@EventsHandler(DeliveryCompletedEvent)
export class DeliveryCompletedEventMapper implements IEventHandler<DeliveryCompletedEvent> {
  constructor(
    private readonly eventBus: EventBus,
    @InjectPinoLogger(DeliveryCompletedEventMapper.name)
    private readonly logger: PinoLogger,
  ) {}

  handle(event: DeliveryCompletedEvent): void {
    this.logger.info(
      `Mapping DeliveryCompletedEvent for order ${event.orderId}`,
    );

    const mappedEvent = new DeliveryCompletedMappedEvent(
      event.driverId,
      event.orderId,
      event.completedAt,
    );

    this.eventBus.subject$.next(mappedEvent);

    this.logger.info(
      `Mapped event published for completed order ${event.orderId}`,
    );
  }
}
