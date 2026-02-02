import { EventBus, EventsHandler, IEvent, IEventHandler } from "@nestjs/cqrs";
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";
import { OrderStatusChangedEvent } from "../../../orders/core/events/order-status-changed.event";
import { OrderStatus } from "../../../orders/core/types/order-database.types";

export type OrderStatusMapped = OrderStatus;

export class OrderStatusChangedMappedEvent implements IEvent {
  constructor(
    public readonly orderId: string,
    public readonly previousStatus: OrderStatusMapped,
    public readonly newStatus: OrderStatusMapped,
    public readonly changedAt: Date,
  ) {}
}

@EventsHandler(OrderStatusChangedEvent)
export class OrderStatusChangedEventMapper implements IEventHandler<OrderStatusChangedEvent> {
  constructor(
    private readonly eventBus: EventBus,
    @InjectPinoLogger(OrderStatusChangedEventMapper.name)
    private readonly logger: PinoLogger,
  ) {}

  async handle(event: OrderStatusChangedEvent): Promise<void> {
    this.logger.info(
      `Mapping OrderStatusChangedEvent for order ${event.orderId}: ${event.previousStatus} → ${event.newStatus}`,
    );

    const mappedEvent = new OrderStatusChangedMappedEvent(
      event.orderId,
      event.previousStatus,
      event.newStatus,
      event.changedAt,
    );

    this.eventBus.publish(mappedEvent);

    this.logger.info(
      `Published OrderStatusChangedMappedEvent for order ${event.orderId}`,
    );
  }
}
