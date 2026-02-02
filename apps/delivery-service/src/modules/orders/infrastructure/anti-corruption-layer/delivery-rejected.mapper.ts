import { EventsHandler, IEventHandler, EventBus } from "@nestjs/cqrs";
import { IEvent } from "@nestjs/cqrs";
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";
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
export class DeliveryRejectedEventMapper implements IEventHandler<DeliveryRejectedEvent> {
  constructor(
    private readonly eventBus: EventBus,
    @InjectPinoLogger(DeliveryRejectedEventMapper.name)
    private readonly logger: PinoLogger,
  ) {}

  handle(event: DeliveryRejectedEvent): void {
    this.logger.info(
      `Mapping DeliveryRejectedEvent for order ${event.orderId}`,
    );

    const mappedEvent = new DeliveryRejectedMappedEvent(
      event.driverId,
      event.orderId,
      event.reason,
      event.rejectedAt,
    );

    this.eventBus.subject$.next(mappedEvent);

    this.logger.info(
      `Mapped event published for rejected order ${event.orderId}`,
    );
  }
}
